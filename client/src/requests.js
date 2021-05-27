import axios from 'axios';
import { getAccessToken, isLoggedIn } from './auth';

const graphqlApi = axios.create({
  baseURL: 'http://localhost:9000/graphql',
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
  const data = await graphQLRequest(`{
          jobs {
            id
            title
            company {
              id,
              name
            }
          }
        }`);
  return data?.jobs;
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
