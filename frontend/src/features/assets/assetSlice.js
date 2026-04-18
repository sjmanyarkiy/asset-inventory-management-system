import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAssets,
  createAsset as createAssetAPI,
  updateAsset as updateAssetAPI,
  deleteAsset as deleteAssetAPI,
} from "./assetAPI";

const isTestEnv = typeof process !== "undefined" && process?.env?.NODE_ENV === "test";
const isNodeDev = typeof process !== "undefined" && process?.env?.NODE_ENV === "development";
const getViteEnv = () => {
  try {
    // Avoid direct import.meta usage so Jest (CJS runtime) can parse this file.
    return Function("return typeof import !== 'undefined' && typeof import.meta !== 'undefined' ? import.meta.env : undefined;")();
  } catch {
    return undefined;
  }
};

const viteEnv = getViteEnv();
const isViteDev = Boolean(viteEnv?.DEV);
const isViteProd = Boolean(viteEnv?.PROD);
const isDebugOverrideEnabled = String(viteEnv?.VITE_ASSET_OPTIMISTIC_DEBUG || "").toLowerCase() === "true";
const OPTIMISTIC_DEBUG_ENABLED = !isTestEnv && !isViteProd && (isNodeDev || isViteDev || isDebugOverrideEnabled);

const nowIso = () => new Date().toISOString();

const toDebugAssetId = (assetId) => {
  const normalized = toComparable(assetId);
  return normalized || "unknown";
};

const optimisticDebugLog = (event, details = {}) => {
  if (!OPTIMISTIC_DEBUG_ENABLED) return;
  const assetId = details.assetId ?? details.targetId;
  console.debug(`[assets optimistic][asset:${toDebugAssetId(assetId)}] ${event}`, {
    eventTime: nowIso(),
    ...details,
  });
};

const sanitizeQueryParams = (params = {}) => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const TEMP_ID_PREFIX = "temp-asset-";

const extractPayloadFields = (payload) => {
  if (!payload) return {};

  if (typeof FormData !== "undefined" && payload instanceof FormData) {
    const data = {};
    for (const [key, value] of payload.entries()) {
      if (typeof value === "string") {
        data[key] = value;
      }
    }
    return data;
  }

  return { ...payload };
};

const toComparable = (value) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const toOptionalNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeStatus = (value) => {
  return toComparable(value).trim().toLowerCase();
};

const buildOptimisticAsset = (payload, tempId) => {
  return {
    id: tempId,
    name: payload.name || "",
    asset_code: payload.asset_code || "",
    barcode: payload.barcode || "",
    status: payload.status || "available",
    description: payload.description || "",
    category_id: toOptionalNumber(payload.category_id),
    asset_type_id: toOptionalNumber(payload.asset_type_id),
    vendor_id: toOptionalNumber(payload.vendor_id),
    department_id: toOptionalNumber(payload.department_id),
    category: payload.category || "",
    asset_type: payload.asset_type || "",
    vendor: payload.vendor || "",
    department: payload.department || "",
    __optimistic: true,
  };
};

const buildUpdatePatch = (payload) => {
  const patch = {};

  if (payload.name !== undefined) patch.name = payload.name;
  if (payload.asset_code !== undefined) patch.asset_code = payload.asset_code;
  if (payload.barcode !== undefined) patch.barcode = payload.barcode;
  if (payload.status !== undefined) patch.status = payload.status;
  if (payload.description !== undefined) patch.description = payload.description;
  if (payload.category_id !== undefined) patch.category_id = toOptionalNumber(payload.category_id);
  if (payload.asset_type_id !== undefined) patch.asset_type_id = toOptionalNumber(payload.asset_type_id);
  if (payload.vendor_id !== undefined) patch.vendor_id = toOptionalNumber(payload.vendor_id);
  if (payload.department_id !== undefined) patch.department_id = toOptionalNumber(payload.department_id);

  return patch;
};

const assetMatchesQuery = (asset, query = {}) => {
  if (!asset) return false;

  const search = toComparable(query.q).trim().toLowerCase();
  if (search) {
    const haystack = [
      asset.name,
      asset.asset_code,
      asset.barcode,
      asset.category,
      asset.asset_type,
      asset.vendor,
      asset.department,
      asset.status,
    ]
      .map((value) => toComparable(value).toLowerCase())
      .join(" ");

    if (!haystack.includes(search)) {
      return false;
    }
  }

  if (query.category_id !== undefined && query.category_id !== "") {
    if (toComparable(asset.category_id) !== toComparable(query.category_id)) return false;
  }

  if (query.asset_type_id !== undefined && query.asset_type_id !== "") {
    if (toComparable(asset.asset_type_id) !== toComparable(query.asset_type_id)) return false;
  }

  if (query.vendor_id !== undefined && query.vendor_id !== "") {
    if (toComparable(asset.vendor_id) !== toComparable(query.vendor_id)) return false;
  }

  if (query.department_id !== undefined && query.department_id !== "") {
    if (toComparable(asset.department_id) !== toComparable(query.department_id)) return false;
  }

  if (query.status !== undefined && query.status !== "") {
    if (normalizeStatus(asset.status) !== normalizeStatus(query.status)) return false;
  }

  return true;
};

const upsertAssetWithoutDuplicate = (assets, nextAsset, preferredIndex = 0) => {
  const existingIndex = assets.findIndex((asset) => toComparable(asset.id) === toComparable(nextAsset.id));
  if (existingIndex >= 0) {
    assets[existingIndex] = nextAsset;
    return;
  }

  const insertIndex = Math.max(0, Math.min(preferredIndex, assets.length));
  assets.splice(insertIndex, 0, nextAsset);
};

const removeAssetById = (assets, id) => {
  const index = assets.findIndex((asset) => toComparable(asset.id) === toComparable(id));
  if (index >= 0) {
    assets.splice(index, 1);
  }
};

const registerMutationToken = (state, targetId, requestId, operation) => {
  if (!targetId) return null;

  const nextToken = (state.optimistic.mutationSequence || 0) + 1;
  state.optimistic.mutationSequence = nextToken;
  state.optimistic.latestMutationByAssetId[targetId] = {
    requestId,
    operation,
    token: nextToken,
  };

  return nextToken;
};

const isLatestMutationToken = (state, targetId, token) => {
  if (!targetId || token == null) return true;
  return state.optimistic.latestMutationByAssetId[targetId]?.token === token;
};

const clearLatestMutationTokenIfMatch = (state, targetId, token) => {
  if (!targetId || token == null) return;
  if (state.optimistic.latestMutationByAssetId[targetId]?.token === token) {
    delete state.optimistic.latestMutationByAssetId[targetId];
  }
};

/* =========================
   FETCH ASSETS
========================= */
export const fetchAssets = createAsyncThunk(
  "assets/fetchAssets",
  async (params = {}, { rejectWithValue }) => {
    const normalizedParams = sanitizeQueryParams(params);

    try {
      const res = await getAssets(normalizedParams);
      return {
        response: res.data, // { data, total, pages, current_page }
        params: normalizedParams,
      };
    } catch (err) {
      if (!err.response) {
        return rejectWithValue("Cannot reach server. Check your connection and try again.");
      }
      return rejectWithValue(err.response?.data?.error || "Failed to load assets");
    }
  }
);

/* =========================
   CREATE ASSET
========================= */
export const createAsset = createAsyncThunk(
  "assets/createAsset",
  async (assetData, { rejectWithValue }) => {
    try {
      const res = await createAssetAPI(assetData);
      return res.data.data; // created asset
    } catch (err) {
      if (!err.response) {
        return rejectWithValue("Cannot reach server. Please check your connection.");
      }
      return rejectWithValue(err.response?.data?.error || "Create failed");
    }
  }
);

/* =========================
   UPDATE ASSET
========================= */
export const updateAsset = createAsyncThunk(
  "assets/updateAsset",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateAssetAPI(id, data);
      return res.data.data;
    } catch (err) {
      if (!err.response) {
        return rejectWithValue("Cannot reach server. Please check your connection.");
      }
      return rejectWithValue(err.response?.data?.error || "Update failed");
    }
  }
);

/* =========================
   DELETE ASSET
========================= */
export const deleteAsset = createAsyncThunk(
  "assets/deleteAsset",
  async (arg, { rejectWithValue }) => {
    const id = typeof arg === "object" ? arg?.id : arg;

    try {
      await deleteAssetAPI(id);
      return id;
    } catch (err) {
      if (!err.response) {
        return rejectWithValue("Cannot reach server. Please check your connection.");
      }
      return rejectWithValue(err.response?.data?.error || "Delete failed");
    }
  }
);

/* =========================
   SLICE
========================= */
const assetSlice = createSlice({
  name: "assets",

  initialState: {
    data: [],
    meta: {
      total: 0,
      pages: 0,
      current_page: 1,
    },
    lastQuery: {},
    loading: false,
    error: null,
    currentRequestId: null,
    optimistic: {
      creates: {},
      updates: {},
      deletes: {},
      latestUpdateByAssetId: {},
      latestDeleteByAssetId: {},
      latestMutationByAssetId: {},
      mutationSequence: 0,
    },
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* FETCH */
      .addCase(fetchAssets.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }

        state.loading = false;
        state.currentRequestId = null;

        state.data = action.payload?.response?.data || [];
        state.meta = {
          total: action.payload?.response?.total || 0,
          pages: action.payload?.response?.pages || 0,
          current_page: action.payload?.response?.current_page || 1,
        };
        state.lastQuery = action.payload?.params || {};
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }

        state.loading = false;
        state.currentRequestId = null;
        state.error = action.payload || action.error.message;
      })

      /* CREATE */
      .addCase(createAsset.pending, (state, action) => {
        const requestId = action.meta.requestId;
        const payload = extractPayloadFields(action.meta.arg);
        const tempId = `${TEMP_ID_PREFIX}${requestId}`;
        const optimisticAsset = buildOptimisticAsset(payload, tempId);
        const shouldInsert = assetMatchesQuery(optimisticAsset, state.lastQuery);
        const startedAt = nowIso();

        state.optimistic.creates[requestId] = {
          tempId,
          inserted: shouldInsert,
          startedAt,
        };

        optimisticDebugLog("create.pending", {
          assetId: tempId,
          requestId,
          startedAt,
          inserted: shouldInsert,
        });

        if (shouldInsert) {
          upsertAssetWithoutDuplicate(state.data, optimisticAsset, 0);
        }
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        const requestId = action.meta.requestId;
        const entry = state.optimistic.creates[requestId];
        const createdAsset = action.payload;
        const createdId = createdAsset?.id;
        const shouldShowCreated = assetMatchesQuery(createdAsset, state.lastQuery);

        if (entry?.inserted) {
          let tempIndex = state.data.findIndex((asset) => asset.id === entry.tempId);
          const existingCreatedIndex = state.data.findIndex(
            (asset) => toComparable(asset.id) === toComparable(createdId)
          );

          if (tempIndex >= 0) {
            if (shouldShowCreated) {
              if (existingCreatedIndex >= 0 && existingCreatedIndex !== tempIndex) {
                state.data.splice(existingCreatedIndex, 1);
                if (existingCreatedIndex < tempIndex) {
                  tempIndex -= 1;
                }
              }
              state.data[tempIndex] = createdAsset;
            } else {
              state.data.splice(tempIndex, 1);
              if (existingCreatedIndex >= 0) {
                removeAssetById(state.data, createdId);
              }
            }
          } else if (shouldShowCreated && createdId !== undefined) {
            upsertAssetWithoutDuplicate(state.data, createdAsset, 0);
          } else if (!shouldShowCreated && createdId !== undefined) {
            removeAssetById(state.data, createdId);
          }
        } else if (shouldShowCreated && createdAsset?.id !== undefined) {
          upsertAssetWithoutDuplicate(state.data, createdAsset, 0);
        }

        optimisticDebugLog("create.fulfilled", {
          assetId: createdId,
          requestId,
          startedAt: entry?.startedAt,
          finishedAt: nowIso(),
          inserted: entry?.inserted ?? false,
          visibleAfterFulfill: shouldShowCreated,
        });

        delete state.optimistic.creates[requestId];
      })
      .addCase(createAsset.rejected, (state, action) => {
        const requestId = action.meta.requestId;
        const entry = state.optimistic.creates[requestId];
        const reason = action.payload || action.error?.message || "Create failed";
        let rollbackApplied = false;

        if (entry?.inserted) {
          const tempIndex = state.data.findIndex((asset) => asset.id === entry.tempId);
          if (tempIndex >= 0) {
            state.data.splice(tempIndex, 1);
            rollbackApplied = true;
          }
        }

        optimisticDebugLog("create.rejected", {
          assetId: entry?.tempId,
          requestId,
          startedAt: entry?.startedAt,
          finishedAt: nowIso(),
          rollbackApplied,
          rollbackReason: reason,
        });

        delete state.optimistic.creates[requestId];
        state.error = action.payload;
      })

      /* UPDATE */
      .addCase(updateAsset.pending, (state, action) => {
        const requestId = action.meta.requestId;
        const { id, data } = action.meta.arg || {};
        const targetId = toComparable(id);
        const startedAt = nowIso();
        const mutationToken = registerMutationToken(state, targetId, requestId, "update");

        if (targetId) {
          state.optimistic.latestUpdateByAssetId[targetId] = requestId;
        }

        const existingIndex = state.data.findIndex((asset) => toComparable(asset.id) === targetId);
        if (existingIndex < 0) {
          state.optimistic.updates[requestId] = {
            id,
            skipped: true,
            startedAt,
            mutationToken,
          };

          optimisticDebugLog("update.pending.skipped", {
            assetId: id,
            requestId,
            startedAt,
            reason: "asset-not-in-current-list",
          });
          return;
        }

        const previousAsset = state.data[existingIndex];
        const patch = buildUpdatePatch(extractPayloadFields(data));
        const optimisticAsset = {
          ...previousAsset,
          ...patch,
          __optimistic: true,
        };

        const remainsVisible = assetMatchesQuery(optimisticAsset, state.lastQuery);

        state.optimistic.updates[requestId] = {
          id,
          previousAsset,
          previousIndex: existingIndex,
          removed: !remainsVisible,
          startedAt,
          mutationToken,
        };

        optimisticDebugLog("update.pending", {
          assetId: id,
          requestId,
          startedAt,
          removedFromCurrentView: !remainsVisible,
        });

        if (remainsVisible) {
          state.data[existingIndex] = optimisticAsset;
        } else {
          state.data.splice(existingIndex, 1);
        }
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        const requestId = action.meta.requestId;
        const entry = state.optimistic.updates[requestId];
        const updatedAsset = action.payload;
        const targetId = toComparable(entry?.id ?? updatedAsset?.id);
        const isLatestUpdateForAsset = targetId
          ? state.optimistic.latestUpdateByAssetId[targetId] === requestId
          : true;
        const isLatestMutationForAsset = isLatestMutationToken(
          state,
          targetId,
          entry?.mutationToken
        );
        const shouldShowUpdated = assetMatchesQuery(updatedAsset, state.lastQuery);
        const shouldApply = isLatestUpdateForAsset && isLatestMutationForAsset;

        if (!shouldApply) {
          optimisticDebugLog("update.fulfilled.stale_ignored", {
            assetId: entry?.id ?? updatedAsset?.id,
            requestId,
            startedAt: entry?.startedAt,
            finishedAt: nowIso(),
            staleUpdateIgnored: !isLatestUpdateForAsset,
            staleMutationIgnored: !isLatestMutationForAsset,
          });
        }

        if (shouldApply && !entry?.skipped) {
          const currentIndex = state.data.findIndex(
            (asset) => toComparable(asset.id) === toComparable(updatedAsset?.id ?? entry?.id)
          );

          if (entry?.removed) {
            if (shouldShowUpdated && updatedAsset?.id !== undefined) {
              upsertAssetWithoutDuplicate(state.data, updatedAsset, entry.previousIndex ?? 0);
            }
          } else if (currentIndex >= 0) {
            if (shouldShowUpdated) {
              state.data[currentIndex] = updatedAsset;
            } else {
              state.data.splice(currentIndex, 1);
            }
          } else if (shouldShowUpdated && updatedAsset?.id !== undefined) {
            upsertAssetWithoutDuplicate(state.data, updatedAsset, entry?.previousIndex ?? 0);
          }
        }

        optimisticDebugLog("update.fulfilled", {
          assetId: entry?.id ?? updatedAsset?.id,
          requestId,
          startedAt: entry?.startedAt,
          finishedAt: nowIso(),
          staleIgnored: !shouldApply,
          skipped: entry?.skipped ?? false,
          mutationToken: entry?.mutationToken,
          visibleAfterFulfill: shouldShowUpdated,
        });

        if (targetId && state.optimistic.latestUpdateByAssetId[targetId] === requestId) {
          delete state.optimistic.latestUpdateByAssetId[targetId];
        }

        clearLatestMutationTokenIfMatch(state, targetId, entry?.mutationToken);

        delete state.optimistic.updates[requestId];
      })
      .addCase(updateAsset.rejected, (state, action) => {
        const requestId = action.meta.requestId;
        const entry = state.optimistic.updates[requestId];
        const targetId = toComparable(entry?.id);
        const isLatestUpdateForAsset = targetId
          ? state.optimistic.latestUpdateByAssetId[targetId] === requestId
          : true;
        const isLatestMutationForAsset = isLatestMutationToken(
          state,
          targetId,
          entry?.mutationToken
        );
        const shouldApply = isLatestUpdateForAsset && isLatestMutationForAsset;
        const reason = action.payload || action.error?.message || "Update failed";
        let rollbackApplied = false;

        if (shouldApply && entry && !entry.skipped) {
          const snapshot = entry.previousAsset;
          const currentIndex = state.data.findIndex(
            (asset) => toComparable(asset.id) === toComparable(entry.id)
          );

          if (entry.removed) {
            upsertAssetWithoutDuplicate(state.data, snapshot, entry.previousIndex ?? 0);
            rollbackApplied = true;
          } else if (currentIndex >= 0) {
            state.data[currentIndex] = snapshot;
            rollbackApplied = true;
          } else {
            upsertAssetWithoutDuplicate(state.data, snapshot, entry.previousIndex ?? 0);
            rollbackApplied = true;
          }
        }

        optimisticDebugLog("update.rejected", {
          assetId: entry?.id,
          requestId,
          startedAt: entry?.startedAt,
          finishedAt: nowIso(),
          staleIgnored: !shouldApply,
          staleUpdateIgnored: !isLatestUpdateForAsset,
          staleMutationIgnored: !isLatestMutationForAsset,
          mutationToken: entry?.mutationToken,
          rollbackApplied,
          rollbackReason: reason,
        });

        if (targetId && state.optimistic.latestUpdateByAssetId[targetId] === requestId) {
          delete state.optimistic.latestUpdateByAssetId[targetId];
        }

        clearLatestMutationTokenIfMatch(state, targetId, entry?.mutationToken);

        delete state.optimistic.updates[requestId];
        state.error = action.payload;
      })

      /* DELETE */
      .addCase(deleteAsset.pending, (state, action) => {
        const requestId = action.meta.requestId;
        const rawArg = action.meta.arg;
        const id = typeof rawArg === "object" ? rawArg?.id : rawArg;
        const targetId = toComparable(id);
        const startedAt = nowIso();
        const mutationToken = registerMutationToken(state, targetId, requestId, "delete");

        if (targetId) {
          state.optimistic.latestDeleteByAssetId[targetId] = requestId;
        }

        const index = state.data.findIndex((asset) => toComparable(asset.id) === targetId);

        if (index < 0) {
          state.optimistic.deletes[requestId] = {
            id,
            removed: false,
            startedAt,
            mutationToken,
          };

          optimisticDebugLog("delete.pending.skipped", {
            assetId: id,
            requestId,
            startedAt,
            reason: "asset-not-in-current-list",
          });
          return;
        }

        const removedAsset = state.data[index];
        state.data.splice(index, 1);

        state.optimistic.deletes[requestId] = {
          id,
          removed: true,
          removedAsset,
          removedIndex: index,
          startedAt,
          mutationToken,
        };

        optimisticDebugLog("delete.pending", {
          assetId: id,
          requestId,
          startedAt,
          removedFromCurrentView: true,
        });
      })
      .addCase(deleteAsset.fulfilled, (state, action) => {
        const requestId = action.meta.requestId;
        const rawArg = action.meta.arg;
        const id = typeof rawArg === "object" ? rawArg?.id : rawArg;
        const targetId = toComparable(id);
        const entry = state.optimistic.deletes[requestId];
        const isLatestMutationForAsset = isLatestMutationToken(
          state,
          targetId,
          entry?.mutationToken
        );

        optimisticDebugLog("delete.fulfilled", {
          assetId: id,
          requestId,
          startedAt: entry?.startedAt,
          finishedAt: nowIso(),
          staleMutationIgnored: !isLatestMutationForAsset,
          mutationToken: entry?.mutationToken,
        });

        if (targetId && state.optimistic.latestDeleteByAssetId[targetId] === requestId) {
          delete state.optimistic.latestDeleteByAssetId[targetId];
        }

        clearLatestMutationTokenIfMatch(state, targetId, entry?.mutationToken);

        delete state.optimistic.deletes[requestId];
      })
      .addCase(deleteAsset.rejected, (state, action) => {
        const requestId = action.meta.requestId;
        const entry = state.optimistic.deletes[requestId];
        const targetId = toComparable(entry?.id);
        const isLatestDeleteForAsset = targetId
          ? state.optimistic.latestDeleteByAssetId[targetId] === requestId
          : true;
        const isLatestMutationForAsset = isLatestMutationToken(
          state,
          targetId,
          entry?.mutationToken
        );
        const shouldApply = isLatestDeleteForAsset && isLatestMutationForAsset;
        const reason = action.payload || action.error?.message || "Delete failed";
        let rollbackApplied = false;

        if (shouldApply && entry?.removed && entry.removedAsset) {
          upsertAssetWithoutDuplicate(state.data, entry.removedAsset, entry.removedIndex ?? 0);
          rollbackApplied = true;
        }

        optimisticDebugLog("delete.rejected", {
          assetId: entry?.id,
          requestId,
          startedAt: entry?.startedAt,
          finishedAt: nowIso(),
          staleIgnored: !shouldApply,
          staleDeleteIgnored: !isLatestDeleteForAsset,
          staleMutationIgnored: !isLatestMutationForAsset,
          mutationToken: entry?.mutationToken,
          rollbackApplied,
          rollbackReason: reason,
        });

        if (targetId && state.optimistic.latestDeleteByAssetId[targetId] === requestId) {
          delete state.optimistic.latestDeleteByAssetId[targetId];
        }

        clearLatestMutationTokenIfMatch(state, targetId, entry?.mutationToken);

        delete state.optimistic.deletes[requestId];
        state.error = action.payload;
      });
  },
});

export default assetSlice.reducer;