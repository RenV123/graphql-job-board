import React, { Component } from 'react';
import { JobList } from './JobList';
import { getJobs } from './requests.js';

export class JobBoard extends Component {
  constructor(props) {
    super(props);
    this.state = { jobs: [] };
  }

  async componentDidMount() {
    const jobs = await getJobs();
    this.setState({ jobs });
  }

  render() {
    const { jobs } = this.state;
    return (
      <div>
        <h1 className='title'>Job Board</h1>
        <JobList jobs={jobs} />
      </div>
    );
  }
}
