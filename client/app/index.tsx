import { GetServerSideProps } from 'next';
import LandingPage from './page';

export default function Home() {
  return <LandingPage />;
}

// Runs ONLY on the server for every request
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res } = context;

  const token = req.cookies?.token; // here to replace with your auth logic

  if (token) {
    // User is logged in → Redirect to dashboard
    return {
      redirect: {
        destination: '/dashboard', //  logged-in page
        permanent: false,
      },
    };
  }

  // User NOT logged in → Show landing page
  return { props: {} };
};
