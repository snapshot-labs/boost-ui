import gql from 'graphql-tag';
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache
} from '@apollo/client/core';

// @ts-ignore
const httpLink = createHttpLink({ uri: 'https://hub.snapshot.org/graphql' });

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

export const PROPOSAL_QUERY = gql`
  query ($id: String!) {
    proposal(id: $id) {
      id
      title
      link
      start
      end
      votes
    }
  }
`;
