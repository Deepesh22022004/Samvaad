"use client"
import { FC, use, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'
import { Icons } from './Icons'
import { useSocket } from '@/context/SocketProvider'
import { toast } from 'react-hot-toast'
import IncomingCallToast from './IncomingCallToast'
import { useToast } from '@/context/ToastProvider'

interface CallButtonProps {
  chatPartner : User
  chatUser: User
  roomId: string,

}

const CallButton: FC<CallButtonProps> = ({
  chatPartner,
  chatUser,
  roomId
}) => {
    const socket = useSocket();
    const router = useRouter();
    const { showToast } = useToast();
    const chatPartnerEmail = chatPartner.email;

    const handleCallButton = useCallback(() => {

      socket.emit('room:join', { roomId: roomId, emailId: chatUser.email, name: chatUser.name , image: chatUser.image , callingTo: chatPartnerEmail });
     
      
    }, [socket, roomId, chatUser.email]);


    const handleJoinRoom = useCallback((data: any) => {
      const { roomId ,emailId} = data;
      router.push(`/dashboard/call/${roomId}`);
    },[])

    const handleAcceptCall =useCallback(() => {
      handleCallButton();
    },[])
  
    const handleRejectCall = useCallback(() => {
    const emailTo = chatPartner.email;
    socket.emit("call:reject", { to: emailTo, reason: "Call was rejected by the callee" });
    toast.dismiss();
    router.push(`/dashboard/chat/${roomId}`);
  },[])


    const handleIncomingToast = useCallback((data: any) => {
      const {emailId,name,image,callingTo} = data;
      if (emailId === chatUser.email) {
        return;
      }
      
      if(chatUser.email === callingTo ){
        showToast("incomingCall", {
          name,
          image,
          onAccept: () => handleAcceptCall(),
          onReject: () => handleRejectCall(),
        });
      }
      
    },[chatUser.email, handleAcceptCall, handleRejectCall])

    const handleCallDenied = useCallback(() => {
      // Notify caller and redirect
      toast.error("Call rejected by the callee.");
      router.push("/dashboard");
    }, [router]);

    
  

    useEffect(() => {
      socket.on('room:join', handleJoinRoom);
      socket.on('incomming:toast',handleIncomingToast)
      socket.on("call:denied", handleCallDenied); // Listen for call denial


      return () => {
        socket.off('room:join', handleJoinRoom);
        socket.off('incomming:toast',handleIncomingToast);
        socket.off("call:denied", handleCallDenied); // Listen for call denial

      }
    },[socket])

  return (
    <Button
      size='sm'
      variant='ghost'
      onClick={handleCallButton}
    >
      <Icons.PhoneCall className='h-6 w-auto text-red-600' />
    </Button>
  );
};

export default CallButton;