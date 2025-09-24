@echo off
echo GitHub Pages Setup for Balance Ball
echo =====================================
echo.
echo 1. Go to github.com and create a new repository named: balance-ball
echo 2. Make it PUBLIC (required for free GitHub Pages)
echo 3. Don't initialize with README
echo.
echo 4. Copy and paste these commands (replace YOUR_USERNAME):
echo.
echo git remote add origin https://github.com/YOUR_USERNAME/balance-ball.git
echo git branch -M main  
echo git push -u origin main
echo.
echo 5. Then in GitHub:
echo    - Go to Settings tab
echo    - Click Pages (left sidebar)  
echo    - Source: Deploy from a branch
echo    - Branch: main, / (root)
echo    - Click Save
echo.
echo 6. Your game URL will be:
echo    https://YOUR_USERNAME.github.io/balance-ball/
echo.
echo 7. Wait 2-5 minutes for deployment, then test on your mobile!
echo.
pause