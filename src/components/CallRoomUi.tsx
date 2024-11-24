"use client";

import React, { FC, useState } from 'react';
import Button from './ui/Button';
import ReactPlayer from 'react-player';

interface CallRoomUIProps {
  remoteSocketId: string | null;
  remoteEmailId: string;
  myStream: MediaStream | null | undefined;
  remoteStream: MediaStream | null | undefined;
  onCall: boolean;
  handleCallUser: () => void;
  handleEndCall: () => void;
  toggleVideo: () => void;
  isVideoEnabled: boolean;
}

const CallRoomUI: FC<CallRoomUIProps> = ({
  remoteSocketId,
  remoteEmailId,
  myStream,
  remoteStream,
  onCall,
  handleCallUser,
  handleEndCall,
  toggleVideo,
  isVideoEnabled,
}) => {



  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Note */}
      <div className="p-4 bg-white shadow-sm">
        <p className="text-center text-red-600 font-bold text-lg">NOTE:</p>
        <p className="text-center text-gray-700">
          Your friend must be online and be on the chat to start the call.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center">
        {!remoteSocketId && (
          <div className="absolute top-1/3 text-center">
            <p className="text-gray-600 font-semibold text-lg">RINGING......</p>
          </div>
        )}

        {myStream && (
          <div
            className={`flex ${onCall || remoteSocketId ? 'flex-row' : 'flex-col'
              } flex-wrap w-full max-w-5xl mx-auto gap-4`}
          >
            {/* User Video */}
            <div
              className={`flex-1 ${remoteSocketId ? 'w-1/2' : 'w-full'
                } bg-black rounded-lg shadow-md`}
            >
              <ReactPlayer
                playing={true}
                pip={true}
                controls
                width="100%"
                height="100%"
                url={myStream}
              />
              <p className="text-center text-sm text-gray-400">Your Video</p>
            </div>

            {/* Remote Video */}
            {remoteStream && (
              <div className="flex-1 w-1/2 bg-black rounded-lg shadow-md">
                <ReactPlayer
                  playing={true}
                  pip={true}
                  controls
                  width="100%"
                  height="100%"
                  url={remoteStream}
                />
                <p className="text-center text-sm text-gray-400">
                  Friend Video
                </p>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        {remoteSocketId && !onCall && (
          <div className="flex flex-col items-center space-y-4">
            {/* Success Message */}
            <div className="bg-green-100 text-green-800 font-semibold p-3 rounded-lg shadow-md w-full max-w-md text-center">
              Successfully connected to your friend {' '}
              <span className="text-green-600">{remoteEmailId}</span>!
            </div>

            {/* Start Call Button */}
            <Button
              variant="default"
              size="lg"
              onClick={handleCallUser}
              className="mt-8 bg-green-500 hover:bg-green-700 text-white"
            >
              START CALL
            </Button>
          </div>
        )}
        {onCall && (
          <div className="flex flex-col items-center space-y-4">

            {/* End Call Button */}
            <div className="flex justify-center space-x-4 mt-8">
              <Button
                variant="default"
                size="lg"
                onClick={toggleVideo }
                className={`bg-purple-500 hover:bg-purple-700 text-white ${isVideoEnabled ? 'opacity-100' : 'opacity-50'
                  }`}
              >
                {isVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}
              </Button>
              <Button
                variant="default"
                size="lg"
                onClick={handleEndCall}
                className="bg-red-500 hover:bg-red-700 text-white"
              >
                END CALL
              </Button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CallRoomUI;
