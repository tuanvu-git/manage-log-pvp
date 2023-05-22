set folder="%~dp0/prisma/migrations"
cd /d %folder%
for /F "delims=" %%i in ('dir /b') do (rmdir "%%i" /s/q || del "%%i" /s/q)

cd ..
del "*.db*"
cd "%~dp0"
del "package-lock.json"
CALL npm install
start /b npm run migrate-dev 
start /b npm run dev
pause
start /b node server.js

@REM start /b npx prisma studio