

https://github.com/Shobhit2806/Vercel/assets/42289748/1aa4bead-7113-44f2-b25e-fb4f26844257

Steps to Run
1. Start Redis using docker
      - Start docker desktop
      - docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest

2. Run upload service , deploy service & request hanler using cmd node dist/index.js for each service.
3. Run FE.
