@echo off
echo Deploying to Vercel...
git add .
git commit -m "Simplify linking object to fix Babel compatibility issues"
git push origin master
echo Deployment triggered!
pause
