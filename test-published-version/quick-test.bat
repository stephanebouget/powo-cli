@echo off
REM 🧪 Quick Test Script for powo-cli Published Version
REM Windows Batch version for developers who prefer command line

echo.
echo ============================================
echo  🌐 powo-cli Published Version Quick Test
echo ============================================
echo.

REM Change to the test directory
cd /d "%~dp0"

REM Run the complete test
echo 🚀 Running complete test suite...
echo.

node test-all.js

echo.
echo ✅ Test completed! Check results above.
echo.
pause