import { FC, useEffect } from 'react';
import Router from 'next/router';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async context => ({
  props: {
    url: context.req.headers.referer || '',
  },
});

const Signup: FC<{ url: string }> = ({ url }) => {
  useEffect(() => {
    Router.push(url ?? '/');
  });
  return null;
};

export default Signup;
