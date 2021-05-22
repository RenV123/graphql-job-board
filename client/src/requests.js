import axios from 'axios';

const graphqlApi = axios.create({
  baseURL: 'http://localhost:9000/graphql',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getJobs = async () => {
  try {
    const response = await graphqlApi.post('', {
      query: `{
          jobs {
            id
            title
            company {
              id,
              name
            }
          }
        }`,
    });
    return response.data.data.jobs;
  } catch (error) {
    console.error(error.message);
  }
};
