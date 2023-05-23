del "package-lock.json"
CALL npm install
start /b npm run migrate-dev 
start /b npm run dev
pause
start /b node server.js

@REM start /b npx prisma studio