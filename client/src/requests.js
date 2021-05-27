import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  gql,
} from '@apollo/client/core';
import { getAccessToken, isLoggedIn } from './auth';

const endPointURL = 'http://localhost:9000/graphql';

/*
Some explanation about Apollo Link:
Apollo link is a lib that helps to customize the flow 
between apollo client and server.
Links are used to modify a graphql operation.

By default HttpLink is used to send a request to a server.
We modify this operation with an ApolloLink to add our own
auth header.

Operation is the graphql is the query or mutation that will be executed.

*/

const authLink = new ApolloLink((operation, forward) => {
  if (isLoggedIn()) {
    operation.setContext({
      headers: {
        authorization: 'Bearer ' + getAccessToken(),
      },
    });
  }

  //Syntax to call the next part of the graphql operation (chain)
  return forward(operation);
});

const client = new ApolloClient({
  link: ApolloLink.from([authLink, new HttpLink({ uri: endPointURL })]),
  //We store api data in memory, it's also possible to store it in localstorage
  cache: new InMemoryCache(),
});

const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    title
    description
    company {
      id
      name
    }
  }
`;

const companyQuery = gql`
  query CompanyQuery($id: ID!) {
    company(id: $id) {
      name
      description
      jobs {
        id
        title
      }
    }
  }
`;

const createJobMutation = gql`
  mutation CreateJob($input: CreateJobInput) {
    job: createJob(input: $input) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

const jobQuery = gql`
  query JobQuery($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

const jobsQuery = gql`
  query JobsQuery {
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

export const getCompanyById = async (id) => {
  const {
    data: { company },
  } = await client.query({ query: companyQuery, variables: { id } });
  return company;
};

export const getJobs = async () => {
  //Setting fetchPolicy to 'no-cache' makes sure we always
  //do a request to the server instead of fetching cached data.
  const {
    data: { jobs },
  } = await client.query({ query: jobsQuery, fetchPolicy: 'no-cache' });
  return jobs;
};

export const getJobById = async (id) => {
  const {
    data: { job },
  } = await client.query({ query: jobQuery, variables: { id } });
  return job;
};

export const createJob = async (title, description) => {
  const {
    data: { job },
  } = await client.mutate({
    mutation: createJobMutation,
    variables: { input: { title, description } },
    /*Update function that we can use to store the resulted job in the cache.
    Notice that we need to specify the query (where did the data come from?)
    and the Id of the object.
    
    Note: it doesn't seem possible to cache a 
    newly created item without passing the query.*/
    update: (cache, { data }) => {
      cache.writeQuery({
        query: jobQuery,
        variables: { id: data.job.id },
        data,
      });
    },
  });
  return job;
};
