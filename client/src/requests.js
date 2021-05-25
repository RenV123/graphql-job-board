import axios from 'axios';

const graphqlApi = axios.create({
  baseURL: 'http://localhost:9000/graphql',
  headers: {
    'Content-Type': 'application/json',
  },
});

const graphQLRequest = async (query, variables = {}) => {
  try {
    const { data } = await graphqlApi.post('', { query, variables });
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
