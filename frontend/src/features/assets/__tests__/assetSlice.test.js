import reducer, { createAsset, deleteAsset, fetchAssets, updateAsset } from "../assetSlice";

describe("assetSlice reliability", () => {
  test("ignores stale fulfilled responses from older requests", () => {
    let state = reducer(undefined, { type: "@@INIT" });

    state = reducer(state, fetchAssets.pending("req-1", { q: "old" }));
    state = reducer(state, fetchAssets.pending("req-2", { q: "new" }));

    state = reducer(
      state,
      fetchAssets.fulfilled(
        {
          response: {
            data: [{ id: 1, name: "Old" }],
            total: 1,
            pages: 1,
            current_page: 1,
          },
          params: { q: "old" },
        },
        "req-1",
        { q: "old" }
      )
    );

    expect(state.data).toEqual([]);
    expect(state.loading).toBe(true);
    expect(state.currentRequestId).toBe("req-2");

    state = reducer(
      state,
      fetchAssets.fulfilled(
        {
          response: {
            data: [{ id: 2, name: "New" }],
            total: 1,
            pages: 1,
            current_page: 1,
          },
          params: { q: "new" },
        },
        "req-2",
        { q: "new" }
      )
    );

    expect(state.data).toEqual([{ id: 2, name: "New" }]);
    expect(state.lastQuery).toEqual({ q: "new" });
    expect(state.loading).toBe(false);
    expect(state.currentRequestId).toBeNull();
  });

  test("stores friendly error for latest rejected request", () => {
    let state = reducer(undefined, { type: "@@INIT" });
    state = reducer(state, fetchAssets.pending("req-3", {}));

    state = reducer(
      state,
      fetchAssets.rejected(
        { message: "Rejected" },
        "req-3",
        {},
        "Cannot reach server. Check your connection and try again."
      )
    );

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Cannot reach server. Check your connection and try again.");
  });

  test("optimistic create adds temp item and replaces it on success", () => {
    let state = reducer(undefined, { type: "@@INIT" });

    state = reducer(
      state,
      createAsset.pending("create-1", {
        name: "Optimistic Asset",
        barcode: "OPT-1",
        asset_code: "OPT-CODE-1",
        status: "available",
      })
    );

    expect(state.data).toHaveLength(1);
    expect(state.data[0].id).toBe("temp-asset-create-1");
    expect(state.data[0].name).toBe("Optimistic Asset");

    state = reducer(
      state,
      createAsset.fulfilled(
        {
          id: 501,
          name: "Optimistic Asset",
          barcode: "OPT-1",
          asset_code: "OPT-CODE-1",
          status: "available",
        },
        "create-1",
        {}
      )
    );

    expect(state.data).toHaveLength(1);
    expect(state.data[0].id).toBe(501);
    expect(state.data[0].__optimistic).toBeUndefined();
  });

  test("optimistic create rolls back temp item on failure", () => {
    let state = reducer(undefined, { type: "@@INIT" });

    state = reducer(
      state,
      createAsset.pending("create-2", {
        name: "Failing Asset",
        barcode: "OPT-2",
      })
    );

    expect(state.data).toHaveLength(1);

    state = reducer(
      state,
      createAsset.rejected(
        { message: "Rejected" },
        "create-2",
        {},
        "Create failed"
      )
    );

    expect(state.data).toHaveLength(0);
    expect(state.error).toBe("Create failed");
  });

  test("optimistic create fulfilled still upserts when temp row is gone", () => {
    let state = reducer(undefined, { type: "@@INIT" });
    state = {
      ...state,
      data: [{ id: 77, name: "Existing" }],
    };

    state = reducer(
      state,
      createAsset.pending("create-race-1", {
        name: "Race Created",
        barcode: "RC-1",
      })
    );

    state = {
      ...state,
      data: state.data.filter((asset) => asset.id !== "temp-asset-create-race-1"),
    };

    state = reducer(
      state,
      createAsset.fulfilled(
        {
          id: 88,
          name: "Race Created",
          barcode: "RC-1",
          status: "available",
        },
        "create-race-1",
        {}
      )
    );

    expect(state.data.map((asset) => asset.id)).toEqual([88, 77]);
  });

  test("optimistic create avoids duplicates when server row already exists", () => {
    let state = reducer(undefined, { type: "@@INIT" });
    state = {
      ...state,
      data: [
        { id: 90, name: "Already There" },
      ],
    };

    state = reducer(
      state,
      createAsset.pending("create-race-2", {
        name: "Already There",
        barcode: "RC-2",
      })
    );

    expect(state.data).toHaveLength(2);

    state = reducer(
      state,
      createAsset.fulfilled(
        {
          id: 90,
          name: "Already There",
          barcode: "RC-2",
          status: "available",
        },
        "create-race-2",
        {}
      )
    );

    expect(state.data).toHaveLength(1);
    expect(state.data[0].id).toBe(90);
  });

  test("optimistic update patches immediately and restores snapshot on failure", () => {
    let state = reducer(undefined, { type: "@@INIT" });
    state = {
      ...state,
      data: [
        {
          id: 10,
          name: "Original Name",
          status: "available",
          barcode: "B-10",
        },
      ],
    };

    state = reducer(
      state,
      updateAsset.pending("update-1", {
        id: 10,
        data: {
          name: "Updated Name",
          status: "under_repair",
        },
      })
    );

    expect(state.data).toHaveLength(1);
    expect(state.data[0].name).toBe("Updated Name");
    expect(state.data[0].status).toBe("under_repair");

    state = reducer(
      state,
      updateAsset.rejected(
        { message: "Rejected" },
        "update-1",
        {},
        "Update failed"
      )
    );

    expect(state.data).toHaveLength(1);
    expect(state.data[0].name).toBe("Original Name");
    expect(state.data[0].status).toBe("available");
    expect(state.error).toBe("Update failed");
  });

  test("stale optimistic update rejection does not rollback a newer update", () => {
    let state = reducer(undefined, { type: "@@INIT" });
    state = {
      ...state,
      data: [
        {
          id: 30,
          name: "Original",
          status: "available",
        },
      ],
    };

    state = reducer(
      state,
      updateAsset.pending("update-old", {
        id: 30,
        data: {
          name: "First Change",
        },
      })
    );

    state = reducer(
      state,
      updateAsset.pending("update-new", {
        id: 30,
        data: {
          name: "Second Change",
        },
      })
    );

    expect(state.data[0].name).toBe("Second Change");

    state = reducer(
      state,
      updateAsset.rejected(
        { message: "Rejected" },
        "update-old",
        {},
        "Update failed"
      )
    );

    expect(state.data[0].name).toBe("Second Change");
  });

  test("optimistic delete removes immediately and restores on failure", () => {
    let state = reducer(undefined, { type: "@@INIT" });
    state = {
      ...state,
      data: [
        { id: 20, name: "Delete Me" },
        { id: 21, name: "Keep Me" },
      ],
    };

    state = reducer(
      state,
      deleteAsset.pending("delete-1", {
        id: 20,
      })
    );

    expect(state.data.map((asset) => asset.id)).toEqual([21]);

    state = reducer(
      state,
      deleteAsset.rejected(
        { message: "Rejected" },
        "delete-1",
        { id: 20 },
        "Delete failed"
      )
    );

    expect(state.data.map((asset) => asset.id)).toEqual([20, 21]);
    expect(state.error).toBe("Delete failed");
  });

  test("stale optimistic delete rejection does not restore after newer delete", () => {
    let state = reducer(undefined, { type: "@@INIT" });
    state = {
      ...state,
      data: [
        { id: 42, name: "Race Delete" },
      ],
    };

    state = reducer(
      state,
      deleteAsset.pending("delete-old", { id: 42 })
    );

    state = reducer(
      state,
      deleteAsset.pending("delete-new", { id: 42 })
    );

    state = reducer(
      state,
      deleteAsset.fulfilled(42, "delete-new", { id: 42 })
    );

    state = reducer(
      state,
      deleteAsset.rejected(
        { message: "Rejected" },
        "delete-old",
        { id: 42 },
        "Delete failed"
      )
    );

    expect(state.data).toEqual([]);
  });

  test("stale update rejection does not rollback after newer successful delete", () => {
    let state = reducer(undefined, { type: "@@INIT" });
    state = {
      ...state,
      data: [
        { id: 71, name: "Original Name", status: "available" },
      ],
    };

    state = reducer(
      state,
      updateAsset.pending("update-old", {
        id: 71,
        data: { name: "Updated Name" },
      })
    );

    state = reducer(
      state,
      deleteAsset.pending("delete-new", { id: 71 })
    );

    state = reducer(
      state,
      deleteAsset.fulfilled(71, "delete-new", { id: 71 })
    );

    state = reducer(
      state,
      updateAsset.rejected(
        { message: "Rejected" },
        "update-old",
        { id: 71 },
        "Update failed"
      )
    );

    expect(state.data).toEqual([]);
  });
});
