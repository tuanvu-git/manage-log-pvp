del "package-lock.json"
CALL npm install
start /b npm run migrate-dev 
start /b npm run dev


@REM start /b npx prisma studio