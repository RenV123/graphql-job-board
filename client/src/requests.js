import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  gql,
} from '@apollo/client/core';
import axios from 'axios';
import { getAccessToken, isLoggedIn } from './auth';

const endPointURL = 'http://localhost:9000/graphql';

const client = new ApolloClient({
  link: new HttpLink({ uri: endPointURL }),
  //We store api data in memory, it's also possible to store it in localstorage
  cache: new InMemoryCache(),
});

const graphqlApi = axios.create({
  baseURL: endPointURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const graphQLRequest = async (query, variables = {}) => {
  try {
    const config = {
      headers: { 'content-type': 'application/json' },
    };
    if (isLoggedIn()) {
      config.headers['authorization'] = 'Bearer ' + getAccessToken();
    }
    const { data } = await graphqlApi.post('', { query, variables }, config);
    return data?.data;
  } catch (error) {
    if (error.response?.data?.errors) {
      const message = error.response.data.errors
        .map((error) => error.message)
        .join('\n');
      throw new Error(message);
    }
  }
};

export const getJobs = async () => {
  const query = gql`
    {
      jobs {
        id
        title
        company {
          id
          name
        }
      }
    }
  `;

  const {
    data: { jobs },
  } = await client.query({ query });
  return jobs;
};

export const getJobById = async (id) => {
  const data = await graphQLRequest(
    `query JobQuery($id: ID!) {
    job(id: $id) {
      id
      title,
      description
      company {
        id
        name
      }
    }
  }`,
    { id }
  );
  return data.job;
};

export const getCompanyById = async (id) => {
  const data = await graphQLRequest(
    `query CompanyQuery($id: ID!) {
      company(id: $id) {
        name,
        description
        jobs {
          id
          title
        }
      }
    }`,
    { id }
  );
  return data.company;
};

export const createJob = async (title, description) => {
  const data = await graphQLRequest(
    `mutation CreateJob($input: CreateJobInput) {
    job: createJob(input: $input) {
      id
      title,
      description
      company {
        id
        name
      }
    }
  }`,
    { input: { title, description } }
  );

  return data.job;
};
