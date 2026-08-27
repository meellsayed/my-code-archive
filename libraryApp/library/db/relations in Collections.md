[[User]]
│
├──────► activeOrder [[cart]]
└──────► [[Role]] (Permissions)

[[Book]]
├──────► [[Author]]
├──────► [[Category]] array
├──────► [[Review]]
├──────► updatedBy [[User]]
├──────► createdBy [[user]]
└──────► [[Publisher  ====]]

[[Customer]]
│
▼
[[order]]
│
├────────► Books ──► [[Book]] array
│
└────────► [[InventoryLog ===]]

[[Borrowings ====]]
│
├────────► Customers ──► [[Customer  ====]]
└────────► Books ──► [[Book]] array
[[Setting===]]!
