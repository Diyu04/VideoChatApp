const app = require("express")();  // express application instance
const server = require("http").createServer(app); // http server and passing express app instance
const cors = require("cors"); // for accepting requests from different users 

// for real time data connection
// socketio initialization , passing http server and config object
const io = require("socket.io")(server, {
	cors: {
		origin: "*", // allow access from all origins
		methods: [ "GET", "POST" ] // allowing get and post only
	}
});

app.use(cors()); // cors middleware 

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
	res.send('Running');
});

io.on("connection", (socket) => { // listens for connection event
	socket.emit("me", socket.id); //


	socket.on("disconnect", () => { // when client disconnects
		socket.broadcast.emit("callEnded")
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	});
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
