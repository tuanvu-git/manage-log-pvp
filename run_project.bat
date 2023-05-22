set folder="%~dp0/prisma/migrations"
cd /d %folder%
for /F "delims=" %%i in ('dir /b') do (rmdir "%%i" /s/q || del "%%i" /s/q)

cd ..
del "*.db*"
cd "%~dp0"
start /b npm install 
start /b npm run migrate-dev 
start /b npm run dev

start /b node server.js

start /b npx prisma studio