import CallRoom from '@/components/CallRoom';
import { FC } from 'react';

interface PageProps {
  params: {
    roomId: string; // we can freely name here
  };
}

const Page: FC<PageProps> = ({ params }) => {
  const { roomId } = params; // Fixed the typo
  return <CallRoom roomId={roomId} />;
};

export default Page;
