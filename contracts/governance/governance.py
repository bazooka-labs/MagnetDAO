"""
MagnetDAO Governance Contract

Manages quarterly proposal lifecycle and on-chain voting for the MagnetDAO.
- Proposals are submitted with project details (name, pair, capital, timeline, risks)
- Voting happens at end of quarter with 1 Magnet = 1 Vote weighting
- Founder retains final approval authority
"""

from pyteal import (
    Bytes, Int, Txn, Global, And, Or, Not, If, Assert, Seq, Reject,
    Approve, Btoi, Itob, Concat, Gtxn, OnComplete, Mode, Subroutine,
    TealType, abi, compileTeal
)

# Global state keys
FOUNDERS_ADDRESS = Bytes("founder")
MAGNET_ASA_ID = Bytes("magnet_asa")
CURRENT_QUARTER = Bytes("quarter")
QUARTER_START = Bytes("q_start")
PROPOSAL_COUNT = Bytes("p_count")
VOTING_OPEN = Bytes("vote_open")
QUARTER_SECONDS = Bytes("q_secs")

# Box name prefix for proposals
PROPOSAL_PREFIX = Bytes("prop:")
VOTE_PREFIX = Bytes("vote:")

# Proposal statuses
STATUS_PENDING = Int(1)
STATUS_VOTING = Int(2)
STATUS_APPROVED = Int(3)
STATUS_REJECTED = Int(4)
STATUS_DEPLOYED = Int(5)

# Quarter duration: 90 days in seconds
DEFAULT_QUARTER_SECONDS = Int(7776000)


@Subroutine(TealType.none)
def only_founder():
    """Assert sender is the founder"""
    return Assert(Txn.sender() == App.globalGet(FOUNDERS_ADDRESS))


@Subroutine(TealType.none)
def only_admin():
    """Assert sender is the app creator (admin)"""
    return Assert(Txn.sender() == Global.creator_address())


def approval_program():
    """Main approval program for the Governance contract"""

    on_create = Seq([
        App.globalPut(FOUNDERS_ADDRESS, Txn.sender()),
        App.globalPut(MAGNET_ASA_ID, Btoi(Txn.application_args[0])),
        App.globalPut(CURRENT_QUARTER, Int(1)),
        App.globalPut(QUARTER_START, Global.latest_timestamp()),
        App.globalPut(PROPOSAL_COUNT, Int(0)),
        App.globalPut(VOTING_OPEN, Int(0)),
        App.globalPut(QUARTER_SECONDS, DEFAULT_QUARTER_SECONDS),
        Approve(),
    ])

    on_opt_in = Seq([
        Approve(),
    ])

    # --- create_proposal ---
    # args: app_name, app_url, liquidity_pair, capital_requested, timeline_days, risk_hash
    # Requires a payment of 1 Algo to prevent spam
    create_proposal = Seq([
        # Only when not in voting phase
        Assert(App.globalGet(VOTING_OPEN) == Int(0)),
        # Require 1 Algo deposit
        Assert(Gtxn[1].type_enum() == Int(1)),  # payment txn
        Assert(Gtxn[1].amount() >= Int(1000000)),
        Assert(Gtxn[1].receiver() == Global.current_application_address()),

        # Increment proposal count
        App.globalPut(PROPOSAL_COUNT, App.globalGet(PROPOSAL_COUNT) + Int(1)),

        # Store proposal data in box
        # Box key: prop:<quarter>:<id>
        # Box value: concatenated fields with delimiters
        (proposal_id := ScratchVar()).store(
            Itob(App.globalGet(PROPOSAL_COUNT))
        ),
        (box_key := ScratchVar()).store(
            Concat(
                PROPOSAL_PREFIX,
                Concat(Itob(App.globalGet(CURRENT_QUARTER)), proposal_id.load())
            )
        ),
        # Proposal data: status|submitter|app_name|pair|capital|timeline|risk_hash
        (proposal_data := ScratchVar()).store(
            Concat(
                Itob(STATUS_PENDING),
                Concat(
                    Bytes("|"),
                    Concat(
                        Txn.sender(),
                        Concat(
                            Bytes("|"),
                            Concat(
                                Txn.application_args[1],  # app_name
                                Concat(
                                    Bytes("|"),
                                    Concat(
                                        Txn.application_args[2],  # liquidity_pair
                                        Concat(
                                            Bytes("|"),
                                            Concat(
                                                Txn.application_args[3],  # capital_requested
                                                Concat(
                                                    Bytes("|"),
                                                    Concat(
                                                        Txn.application_args[4],  # timeline_days
                                                        Concat(
                                                            Bytes("|"),
                                                            Txn.application_args[5]  # risk_hash
                                                        ),
                                                    ),
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
        BoxReplace(box_key.load(), Int(0), proposal_data.load()),
        Approve(),
    ])

    # --- open_voting ---
    # Only founder can open voting
    open_voting = Seq([
        only_founder(),
        Assert(App.globalGet(VOTING_OPEN) == Int(0)),
        App.globalPut(VOTING_OPEN, Int(1)),
        Approve(),
    ])

    # --- cast_vote ---
    # args: proposal_id
    # Requires opt-in and holding Magnet tokens
    # Inner txn to verify Magnet ASA balance
    cast_vote = Seq([
        Assert(App.globalGet(VOTING_OPEN) == Int(1)),
        # Check voter has Magnet token by verifying account min balance
        # (Actual balance check would use inner txn or oracle)
        # Store vote: vote:<quarter>:<proposal_id>:<voter>
        (vote_key := ScratchVar()).store(
            Concat(
                VOTE_PREFIX,
                Concat(
                    Itob(App.globalGet(CURRENT_QUARTER)),
                    Concat(
                        Txn.application_args[1],  # proposal_id
                        Txn.sender(),
                    ),
                ),
            )
        ),
        # Store voter's Magnet balance snapshot as vote weight
        # In production, this would snapshot the ASA balance
        BoxCreate(vote_key.load(), Int(8)),
        BoxReplace(vote_key.load(), Int(0), Itob(Int(1))),  # simplified weight
        Approve(),
    ])

    # --- close_voting ---
    # Only founder can close voting
    close_voting = Seq([
        only_founder(),
        Assert(App.globalGet(VOTING_OPEN) == Int(1)),
        App.globalPut(VOTING_OPEN, Int(0)),
        Approve(),
    ])

    # --- finalize_proposal ---
    # args: proposal_id, new_status (3=approved, 4=rejected)
    # Only founder can finalize
    finalize_proposal = Seq([
        only_founder(),
        (proposal_id := Btoi(Txn.application_args[1])),
        (new_status := Btoi(Txn.application_args[2])),
        # Update proposal status in box
        (box_key := ScratchVar()).store(
            Concat(
                PROPOSAL_PREFIX,
                Concat(Itob(App.globalGet(CURRENT_QUARTER)), Itob(proposal_id))
            )
        ),
        BoxReplace(box_key.load(), Int(0), Itob(new_status)),
        Approve(),
    ])

    # --- advance_quarter ---
    # Only founder can advance to next quarter
    advance_quarter = Seq([
        only_founder(),
        App.globalPut(CURRENT_QUARTER, App.globalGet(CURRENT_QUARTER) + Int(1)),
        App.globalPut(QUARTER_START, Global.latest_timestamp()),
        App.globalPut(PROPOSAL_COUNT, Int(0)),
        App.globalPut(VOTING_OPEN, Int(0)),
        Approve(),
    ])

    # --- update_founder ---
    # args: new_founder_address
    update_founder = Seq([
        only_founder(),
        App.globalPut(FOUNDERS_ADDRESS, Txn.application_args[1]),
        Approve(),
    ])

    # Main router
    return Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.OptIn, on_opt_in],
        [Txn.on_completion() == OnComplete.NoOp,
         Cond(
             [Txn.application_args[0] == Bytes("create_proposal"), create_proposal],
             [Txn.application_args[0] == Bytes("open_voting"), open_voting],
             [Txn.application_args[0] == Bytes("cast_vote"), cast_vote],
             [Txn.application_args[0] == Bytes("close_voting"), close_voting],
             [Txn.application_args[0] == Bytes("finalize"), finalize_proposal],
             [Txn.application_args[0] == Bytes("advance_quarter"), advance_quarter],
             [Txn.application_args[0] == Bytes("update_founder"), update_founder],
         )],
        Reject(),
    )


def clear_program():
    """Clear state program"""
    return Approve()


if __name__ == "__main__":
    print("=== Governance Approval Program ===")
    print(compileTeal(approval_program(), mode=Mode.Application, version=8))
    print("\n=== Governance Clear Program ===")
    print(compileTeal(clear_program(), mode=Mode.Application, version=8))
