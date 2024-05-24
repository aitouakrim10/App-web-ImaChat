#! /usr/bin/bash

# generate backend  tests badges
cd ./backend
npm run test 2>&1  | tail -n 5 | head -n 4 > report_backend.txt
cd ..

NBERR_backend=$(grep -e "failed" ./backend/report_backend.txt | wc -l)

color_backend="red"
v_backend="failed" 
if [[ $NBERR_backend -eq 0 ]]; then   #if nbr errors < 1
    v_backend="passed"
    color_backend="green"
fi
anybadge -o -l "backend Tests" -v "$v_backend" -c "$color_backend" -f "backend_tests.svg"

# genererate front end tests badges

NBERR_CYPRESS=$(grep -e "failed" frontend/report-cypress.txt | wc -l)
v_cypress="failed" 
color_cypress="red"
if [[ $NBERR_CYPRESS -eq 0 ]]; then
  color_cypress="green"
  v_cypress="passed"
fi
anybadge -o -l "frontend Tests" -v "$v_cypress" -c "$color_cypress" -f "frontend_tests.svg"
