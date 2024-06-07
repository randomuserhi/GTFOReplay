using Player;

public static class GTFO {
    public static ushort GetItemID(ItemEquippable? item) {
        // Item ID consists of a 15 bit ID value and a 1 bit flag.
        // The 1 bit flag determines if its Gear or Item.
        // 1 = Gear, 0 = Item.

        if (item != null) {
            if (item.GearIDRange != null) {
                ushort id = ushort.Parse(item.GearIDRange.PlayfabItemInstanceId.Replace("OfflineGear_ID_", string.Empty));
                return (ushort)((id << 1) | 0b0000000000000001);
            } else if (item.ItemDataBlock != null) {
                ushort id = (ushort)item.ItemDataBlock.persistentID;
                return (ushort)((id << 1) & 0b1111111111111110);
            }
        }
        return 0; // Default to 0 regardless of anything.
    }

    public static ushort GetItemID(BackpackItem? item) {
        // Item ID consists of a 15 bit ID value and a 1 bit flag.
        // The 1 bit flag determines if its Gear or Item.
        // 1 = Gear, 0 = Item.

        if (item != null) {
            if (item.GearIDRange != null) {
                ushort id = ushort.Parse(item.GearIDRange.PlayfabItemInstanceId.Replace("OfflineGear_ID_", string.Empty));
                return (ushort)((id << 1) | 0b0000000000000001);
            }
        }
        return 0; // Default to 0 regardless of anything.
    }

    public static ushort GetItemID(Item? item) {
        // Item ID consists of a 15 bit ID value and a 1 bit flag.
        // The 1 bit flag determines if its Gear or Item.
        // 1 = Gear, 0 = Item.

        if (item != null) {
            if (item.ItemDataBlock != null) {
                ushort id = (ushort)item.ItemDataBlock.persistentID;
                return (ushort)((id << 1) & 0b1111111111111110);
            }
        }
        return 0; // Default to 0 regardless of anything.
    }
}
