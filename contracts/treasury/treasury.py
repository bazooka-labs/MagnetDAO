"""
MagnetDAO Treasury Contract

Manages treasury funds and liquidity deployment for the MagnetDAO.
- Receives quarterly funding from Bazooka Labs revenue
- Deploys liquidity to approved proposals (founder must approve)
- All deployments are on-chain and transparent
"""

from pyteal import (
    Bytes, Int, Txn, Global, And, Or, Not, If, Assert, Seq, Reject,
    Approve, Btoi, Itob, Concat, Gtxn, OnComplete, Mode, Subroutine,
    TealType, ScratchVar, Cond, compileTeal, Balance, Gaid
)

# Global state keys
FOUNDERS_ADDRESS = Bytes("founder")
GOVERNANCE_APP_ID = Bytes("gov_app_id")
MAGNET_ASA_ID = Bytes("magnet_asa")
TOTAL_FUNDED = Bytes("total_funded")
TOTAL_DEPLOYED = Bytes("total_deployed")
DEPLOYMENT_COUNT = Bytes("dep_count")

# Box prefix for deployments
DEPLOY_PREFIX = Bytes("deploy:")

# Deployment statuses
DEPLOY_PENDING = Int(1)
DEPLOY_ACTIVE = Int(2)
DEPLOY_WITHDRAWN = Int(3)


@Subroutine(TealType.none)
def only_founder():
    """Assert sender is the founder"""
    return Assert(Txn.sender() == App.globalGet(FOUNDERS_ADDRESS))


def approval_program():
    """Main approval program for the Treasury contract"""

    on_create = Seq([
        App.globalPut(FOUNDERS_ADDRESS, Txn.sender()),
        App.globalPut(GOVERNANCE_APP_ID, Btoi(Txn.application_args[0])),
        App.globalPut(MAGNET_ASA_ID, Btoi(Txn.application_args[1])),
        App.globalPut(TOTAL_FUNDED, Int(0)),
        App.globalPut(TOTAL_DEPLOYED, Int(0)),
        App.globalPut(DEPLOYMENT_COUNT, Int(0)),
        Approve(),
    ])

    on_opt_in = Seq([
        Approve(),
    ])

    # --- deposit_funds ---
    # Called with a payment txn in group
    # Funds the treasury with Algos from Bazooka Labs
    deposit_funds = Seq([
        only_founder(),
        Assert(Gtxn[1].type_enum() == Int(1)),  # payment
        Assert(Gtxn[1].receiver() == Global.current_application_address()),
        App.globalPut(
            TOTAL_FUNDED,
            App.globalGet(TOTAL_FUNDED) + Gtxn[1].amount()
        ),
        Approve(),
    ])

    # --- create_deployment ---
    # args: proposal_id, project_asa_id, amount, dex_name
    # Only founder can create deployment records
    create_deployment = Seq([
        only_founder(),
        (amount := Btoi(Txn.application_args[2])),
        Assert(amount <= (Balance(Global.current_application_address()) - Int(100000))),
        App.globalPut(DEPLOYMENT_COUNT, App.globalGet(DEPLOYMENT_COUNT) + Int(1)),

        (box_key := ScratchVar()).store(
            Concat(
                DEPLOY_PREFIX,
                Itob(App.globalGet(DEPLOYMENT_COUNT))
            )
        ),
        # Deployment data: status|proposal_id|project_asa|amount|dex|deployer
        (deploy_data := ScratchVar()).store(
            Concat(
                Itob(DEPLOY_PENDING),
                Concat(
                    Bytes("|"),
                    Concat(
                        Txn.application_args[1],  # proposal_id
                        Concat(
                            Bytes("|"),
                            Concat(
                                Txn.application_args[2],  # project_asa_id
                                Concat(
                                    Bytes("|"),
                                    Concat(
                                        Txn.application_args[3],  # amount
                                        Concat(
                                            Bytes("|"),
                                            Concat(
                                                Txn.application_args[4],  # dex_name
                                                Concat(
                                                    Bytes("|"),
                                                    Txn.sender(),
                                                ),
                                            ),
                                        ),
                                    ),
                                ),
                            ),
                        ),
                    ),
                ),
            )
        ),
        BoxCreate(box_key.load(), Int(512)),
        BoxReplace(box_key.load(), Int(0), deploy_data.load()),
        Approve(),
    ])

    # --- execute_deployment ---
    # args: deployment_id, destination_address
    # Transfers funds from treasury to deploy
    execute_deployment = Seq([
        only_founder(),
        (deploy_id := Btoi(Txn.application_args[1])),
        (dest_address := Txn.application_args[2]),
        (amount := Btoi(Txn.application_args[3])),

        # Update deployment status to ACTIVE
        (box_key := ScratchVar()).store(
            Concat(DEPLOY_PREFIX, Itob(deploy_id))
        ),
        BoxReplace(box_key.load(), Int(0), Itob(DEPLOY_ACTIVE)),

        # Update total deployed
        App.globalPut(
            TOTAL_DEPLOYED,
            App.globalGet(TOTAL_DEPLOYED) + amount
        ),

        # Send Algos to destination
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            InnerTxnField.type_enum: TxnType.Payment,
            InnerTxnField.receiver: dest_address,
            InnerTxnField.amount: amount,
            InnerTxnField.fee: Int(0),  # fee pooling
        }),
        InnerTxnBuilder.Submit(),
        Approve(),
    ])

    # --- receive_fees ---
    # Swap fees from liquidity pools come back here
    # args: amount
    receive_fees = Seq([
        # Anyone can send fees to treasury
        Assert(Gtxn[1].type_enum() == Int(1)),
        Assert(Gtxn[1].receiver() == Global.current_application_address()),
        Approve(),
    ])

    # --- withdraw_fees ---
    # Only founder can withdraw accumulated fees
    # args: amount
    withdraw_fees = Seq([
        only_founder(),
        (amount := Btoi(Txn.application_args[1])),
        Assert(amount <= (Balance(Global.current_application_address()) - Int(100000))),

        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            InnerTxnField.type_enum: TxnType.Payment,
            InnerTxnField.receiver: Txn.sender(),
            InnerTxnField.amount: amount,
            InnerTxnField.fee: Int(0),
        }),
        InnerTxnBuilder.Submit(),
        Approve(),
    ])

    # --- update_founder ---
    update_founder = Seq([
        only_founder(),
        App.globalPut(FOUNDERS_ADDRESS, Txn.application_args[1]),
        Approve(),
    ])

    # --- update_governance_app ---
    update_governance_app = Seq([
        only_founder(),
        App.globalPut(GOVERNANCE_APP_ID, Btoi(Txn.application_args[1])),
        Approve(),
    ])

    return Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.OptIn, on_opt_in],
        [Txn.on_completion() == OnComplete.NoOp,
         Cond(
             [Txn.application_args[0] == Bytes("deposit"), deposit_funds],
             [Txn.application_args[0] == Bytes("create_deploy"), create_deployment],
             [Txn.application_args[0] == Bytes("execute_deploy"), execute_deployment],
             [Txn.application_args[0] == Bytes("receive_fees"), receive_fees],
             [Txn.application_args[0] == Bytes("withdraw_fees"), withdraw_fees],
             [Txn.application_args[0] == Bytes("update_founder"), update_founder],
             [Txn.application_args[0] == Bytes("update_gov_app"), update_governance_app],
         )],
        Reject(),
    )


def clear_program():
    """Clear state program"""
    return Approve()


if __name__ == "__main__":
    print("=== Treasury Approval Program ===")
    print(compileTeal(approval_program(), mode=Mode.Application, version=8))
    print("\n=== Treasury Clear Program ===")
    print(compileTeal(clear_program(), mode=Mode.Application, version=8))
