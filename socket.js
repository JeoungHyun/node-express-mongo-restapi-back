let io;
module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer,{
        cors:{
          credentials : true         // 소켓 연결시 CORS 문제 해결
        }
      });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("소켓 초기화 안됨");
    }
    return io;
  },
};
