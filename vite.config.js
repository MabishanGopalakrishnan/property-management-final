export default {
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://final_project-backend-1:5000",
        changeOrigin: true,
        secure: false,
      }
    }
  }
}
