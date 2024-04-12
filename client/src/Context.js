import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer'; // used to create WebRTC connections between peers for real-time communication.

const SocketContext = createContext(); // Socket.IO client instance  is created by calling io with the server URL

const socket = io('http://localhost:5000');

const ContextProvider = ({ children }) => {
  // children by props
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');

  const myVideo = useRef(); // create a mutable ref
  const userVideo = useRef();// create references to the local user's video element
  const connectionRef = useRef(); // webrtc connection

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }) // takes permission  from user for camera and audio // returns a promise
      .then((currentStream) => {
        setStream(currentStream);

        myVideo.current.srcObject = currentStream; // populate our video frame on screen  after taking permission
      });

    socket.on('me', (id) => setMe(id)); // listen for specific action

    socket.on('callUser', ({ from, name: callerName, signal }) => { // call
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  }, []); // empty dependency array - means that the effect does not depend on any values from the component scope
  // should not be re-run on subsequent renders, only after the initial render.

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  const callUser = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: id, signalData: data, from: me, name });
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });

    connectionRef.current = peer; // storing peer instance
  };

  const leaveCall = () => {
    setCallEnded(true);

    connectionRef.current.destroy(); // destroy webrtc connection

    window.location.reload(); // reloads the page and provide user new id
  };

  return (
    <SocketContext.Provider value={{
      call,
      callAccepted,
      myVideo,
      userVideo,
      stream,
      name,
      setName,
      callEnded,
      me,
      callUser,
      leaveCall,
      answerCall,
    }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
