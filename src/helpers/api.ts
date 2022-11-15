import gql from 'graphql-tag';
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache
} from '@apollo/client/core';

// @ts-ignore
const httpLink = createHttpLink({ uri: import.meta.env.VITE_API_URL });

export default new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    addTypename: false
  }),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache'
    }
  }
});

export const BOOST_QUERY = gql`
  query ($id: Int!, $chainId: Int!) {
    boost(id: $id, chainId: $chainId) {
      id
      strategyURI
      balance
      guard
      start
      end
      owner
      chainId
      token {
        address
        name
        symbol
        decimals
      }
      strategy {
        strategy
        params
      }
    }
  }
`;

export const STATUS_QUERY = gql`
  query ($boostId: Int!, $recipient: String!, $chainId: Int!) {
    status(boostId: $boostId, recipient: $recipient, chainId: $chainId) {
      boostId
      recipient
      amount
      chainId
      guard
      sig
    }
  }
`;
