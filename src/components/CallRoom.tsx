"use client";

import { useSocket } from '@/context/SocketProvider';
import { FC, useCallback, useEffect, useState } from 'react';
import Button from './ui/Button';
import ReactPlayer from 'react-player';
import peer from '@/lib/peer';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import CallRoomUI from './CallRoomUi';

interface callRoomProps {
  roomId: string
}

const CallRoom: FC<callRoomProps> = ({
  roomId
}) => {
  const socket = useSocket();
  const router = useRouter();

  const [remoteSocketId, setRemoteSocketId] = useState<any>();
  const [myStream, setMyStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream | undefined>(undefined);

  const [remoteEmailId, setRemoteEmailId] = useState<string>('');
  const [onCall, setOnCall] = useState<boolean>(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);


  const handleUserJoined = useCallback(
    (data: any) => {
      const { emailId, id } = data;
      setRemoteSocketId(id);
      setRemoteEmailId(emailId);
    },
    [socket]
  );

  const handleCallUser = useCallback(async () => {
    if (!remoteSocketId || !socket) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMyStream(stream);

      const offer = await peer.getOffer();
      socket.emit('user:call', { offer, to: remoteSocketId });

      if (!peer.peer) return;
      for (const track of stream.getTracks()) {
        peer.peer.addTrack(track, stream);
      }
      setOnCall(true);
    } catch (error) {
      console.error('Error during call:', error);
    }
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }: any) => {

      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const ans = await peer.getAnswer(offer);
      socket.emit('call:accepted', { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    if (!myStream || !peer.peer) return;

    const senders = peer.peer.getSenders();

    for (const track of myStream.getTracks()) {
      const alreadyAdded = senders.some(sender => sender.track === track);
      if (!alreadyAdded) {
        peer.peer.addTrack(track, myStream);
      }
    }
  }, [myStream, peer]);

  const handleCallAccepted = useCallback(
    ({ from, ans }: any) => {
      peer.setLocalDescription(ans);
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    if (!remoteSocketId || !peer.peer) return;
    const offer = await peer.getOffer();
    socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    if (!peer.peer) return;
    peer?.peer.addEventListener('negotiationneeded', handleNegoNeeded);
    return () => {
      if (!peer.peer) return;
      peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }: any) => {
      const ans = await peer.getAnswer(offer);
      socket.emit('peer:nego:done', { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }: any) => {
    await peer.setLocalDescription(ans);
  }, []);


  const toggleVideo = () => {

    if (!myStream) return;
    
    const videoTrack = myStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled; // Toggle the video track
      setIsVideoEnabled(videoTrack.enabled);
      socket.emit('video:toggle', { to: remoteSocketId, isEnabled: videoTrack.enabled }); // Notify remote user
    }
  };

  useEffect(() => {
    const handleRemoteVideoToggle = (data: { isEnabled: boolean }) => {
      if (remoteStream) {
        const videoTrack = remoteStream.getVideoTracks()[0];
        if (videoTrack) videoTrack.enabled = data.isEnabled; // Update video track based on remote toggle
      }
    };
  
    socket.on('video:toggle', handleRemoteVideoToggle);
  
    return () => {
      socket.off('video:toggle', handleRemoteVideoToggle);
    };
  }, [remoteStream, socket]);
  

  useEffect(() => {
    if (!peer.peer) return;

    const handleTrackEvent = (ev: RTCTrackEvent) => {
      const [remoteStream] = ev.streams;
      setRemoteStream(remoteStream);
    };

    peer.peer.addEventListener('track', handleTrackEvent);

    return () => {
      if (!peer.peer) return;
      peer.peer.removeEventListener('track', handleTrackEvent);
    };
  }, []);

  const handleEndCall = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach(track => track.stop());
    }

    socket.emit('call:end', { to: remoteSocketId });

    setMyStream(undefined);
    setRemoteStream(undefined);
    setRemoteSocketId(null);
    setRemoteEmailId('');
    setOnCall(false);

    window.location.href = '/dashboard';
  }, [myStream, remoteSocketId, socket]);

  
  useEffect(() => {
    const handleRemoteEndCall = () => {

      if (myStream) {
        myStream.getTracks().forEach(track => track.stop());
      }

      setMyStream(undefined);
      setRemoteStream(undefined);
      setRemoteSocketId(null);
      setRemoteEmailId('');
      setOnCall(false);

      window.location.href = '/dashboard';
    };

    socket.on('call:end', handleRemoteEndCall);

    return () => {
      socket.off('call:end', handleRemoteEndCall);
    };
  }, [myStream, socket]);

  useEffect(() => {
    const handleCallRejected = (data: { reason: string }) => {
        toast.error("The call was rejected.");
        router.push("/dashboard");
    };

    socket.on("call:rejected", handleCallRejected);

    return () => {
        socket.off("call:rejected", handleCallRejected);
    };
}, [socket, router]);

  useEffect(() => {
    socket.on('user:joined', handleUserJoined);
    socket.on('incomming:call', handleIncommingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('peer:nego:needed', handleNegoNeedIncomming);
    socket.on('peer:nego:final', handleNegoNeedFinal);


    return () => {
      socket.off('user:joined', handleUserJoined);
      socket.off('incomming:call', handleIncommingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('peer:nego:needed', handleNegoNeedIncomming);
      socket.off('peer:nego:final', handleNegoNeedFinal);

    };
  }, [socket, handleUserJoined, handleIncommingCall, handleCallAccepted, handleNegoNeedIncomming, handleNegoNeedFinal]);

  return (
    <CallRoomUI
      remoteSocketId={remoteSocketId}
      remoteEmailId={remoteEmailId}
      myStream={myStream}
      remoteStream={remoteStream}
      onCall={onCall}
      handleCallUser={handleCallUser}
      handleEndCall={handleEndCall}
      toggleVideo={toggleVideo} // Add this
      isVideoEnabled={isVideoEnabled} // Add this
    />
  );
};

export default CallRoom;
