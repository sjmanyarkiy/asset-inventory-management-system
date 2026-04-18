#!/bin/zsh
BASE="http://127.0.0.1:5001"
PASS=0; FAIL=0

check() {
  local label=$1 result=$2 expected=$3
  if echo "$result" | grep -q "$expected"; then
    echo "✅ $label"; PASS=$((PASS+1))
  else
    echo "❌ $label → $(echo $result | head -c 150)"; FAIL=$((FAIL+1))
  fi
}

echo ""; echo "════════ LIVE E2E TEST ════════"

R=$(curl -s "$BASE/"); check "Health check" "$R" "Backend running"

R=$(curl -s -X POST "$BASE/categories" -H "Content-Type: application/json" -d '{"name":"E2E-Laptops","category_code":"E2EL"}')
check "Create category" "$R" "E2E-Laptops"
CAT_ID=$(echo "$R" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id') or d.get('data',{}).get('id',''))" 2>/dev/null)

R=$(curl -s -X POST "$BASE/types" -H "Content-Type: application/json" -d "{\"name\":\"E2E-Hardware\",\"type_code\":\"E2EH\",\"category_id\":$CAT_ID}")
check "Create type" "$R" "E2E-Hardware"
TYPE_ID=$(echo "$R" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id') or d.get('data',{}).get('id',''))" 2>/dev/null)
echo "   cat=$CAT_ID type=$TYPE_ID"

TS=$(date +%s)
R=$(curl -s -X POST "$BASE/assets" -F "name=E2E Laptop" -F "barcode=BC-$TS" -F "asset_code=AC-$TS" -F "status=available" -F "category_id=$CAT_ID" -F "asset_type_id=$TYPE_ID")
check "CREATE asset" "$R" "E2E Laptop"
check "CREATE status=available" "$R" '"available"'
ASSET_ID=$(echo "$R" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)
echo "   asset_id=$ASSET_ID"

R=$(curl -s "$BASE/assets"); check "CREATE appears in list" "$R" "E2E Laptop"

R=$(curl -s "$BASE/assets/$ASSET_ID")
check "GET single asset" "$R" "E2E Laptop"
check "GET single status=available" "$R" '"available"'

R=$(curl -s -X PUT "$BASE/assets/$ASSET_ID" -F "name=E2E Laptop UPDATED" -F "status=under_repair")
check "UPDATE name changed" "$R" "E2E Laptop UPDATED"
check "UPDATE status=under_repair" "$R" '"under_repair"'

R=$(curl -s "$BASE/assets/$ASSET_ID")
check "UPDATE persists on re-fetch" "$R" "E2E Laptop UPDATED"
check "UPDATE status persists" "$R" '"under_repair"'

R=$(curl -s "$BASE/assets?q=E2E+Laptop+UPDATED"); check "SEARCH returns asset" "$R" "E2E Laptop UPDATED"
R=$(curl -s "$BASE/assets?status=under_repair"); check "FILTER by status works" "$R" "E2E Laptop UPDATED"
R=$(curl -s "$BASE/assets?q=ZZZNOMATCH999"); check "EMPTY search returns empty" "$R" '"total":0'

R=$(curl -s -X POST "$BASE/assets" -F "barcode=orphan-test"); check "EDGE missing name=400" "$R" "required"

R=$(curl -s -X DELETE "$BASE/assets/$ASSET_ID"); check "DELETE success" "$R" "deleted successfully"
R=$(curl -s "$BASE/assets/$ASSET_ID"); check "DELETE asset gone" "$R" "not found"
R=$(curl -s "$BASE/assets")
if echo "$R" | grep -q "E2E Laptop UPDATED"; then echo "❌ DELETE still in list"; FAIL=$((FAIL+1))
else echo "✅ DELETE absent from list"; PASS=$((PASS+1)); fi

curl -s -X DELETE "$BASE/types/$TYPE_ID" > /dev/null 2>&1
curl -s -X DELETE "$BASE/categories/$CAT_ID" > /dev/null 2>&1

echo ""; echo "════════ RESULTS: ✅ $PASS passed  ❌ $FAIL failed ════════"; echo ""
