# Case Studies from the 50-Trace Evaluation

These cases are selected from actual trace-level evaluation outputs.

| Case | Trajectory | Judge Label | Recursive Root Cause | Full-Context Root Cause | Why It Matters |
| --- | --- | --- | --- | --- | --- |
| Full-context largest semantic advantage | `tau2-official-retail-57-trial-0-bec0fed4-06b5-4b78-a30a-9c9dccc833bf` | failed_to_validate_refund_method_before_cancellation; evidence=evt_012, evt_013, evt_015, evt_017 | premature_order_cancellation_despite_conditional_refund_request | The assistant failed to validate and disclose the refund-method constraint before executing cancellation. After the... | semantic RLM=0.3333333333333333, full=1.0; anchor RLM=0.6, full=0.6 |
| Recursive method largest anchor-recall advantage | `tau2-official-retail-3-trial-0-a687c1c0-951b-4223-9c77-3c953196c16a` | incomplete_pending_order_search; evidence=evt_012, evt_013, evt_021, evt_023 | Incomplete order coverage: the assistant collapsed a multi-order search into a single discovered matching order and... | The assistant prematurely narrowed the order search instead of checking all five user orders for pending small... | semantic recursive=0.75, full=0.75; anchor recursive=0.8333333333333334, full=0.5 |
