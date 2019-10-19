import React from 'react';
import Header from './header';
import Footer from './footer';
import CheckRequests from './check-requests';
import CheckCommits from './check-commits';
import Deed from './deed';
import Alert, { openAlert } from 'simple-react-alert';
import { confirmAlert } from 'react-confirm-alert';

class Check extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'requests',
      userRequests: null,
      userCommits: null,
      commitToDisplay: null
    };
    this.setCheckDisplay = this.setCheckDisplay.bind(this);
    this.setDeed = this.setDeed.bind(this);
    this.cancelACommitToADeed = this.cancelACommitToADeed.bind(this);
    this.cancelADeedRequest = this.cancelADeedRequest.bind(this);
  }

  setCheckDisplay(newView) {
    this.setState({ view: newView });
  }
  cancelACommitToADeed(id) {
    fetch('api/cancel_commit.php', {
      'method': 'POST',
      'body': JSON.stringify(
        {
          'commit_id': id
        })
    })
      .then(response => response.ok ? response : Promise.reject(new Error('There was in issue canceling this commit.')))
      .then(() => {
        openAlert({ message: 'You have successfully canceled this commit.', type: 'success' });
      })
      .then(() => {
        const updatedCommitList = this.state.userCommits.filter(commit => commit.commit_id !== id);
        this.setState({ userCommits: updatedCommitList });
      })
      .then(() => {
        this.setCheckDisplay('commits');
      })
      .catch(error => {
        console.error(error);
        openAlert({ message: 'There was an issue canceling your commit.', type: 'danger' });
      });
  }
  cancelADeedRequest(id) {
    confirmAlert({
      title: 'Delete this request?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            fetch('api/cancel_request.php', {
              'method': 'POST',
              'body': JSON.stringify(
                {
                  'request_id': id
                })
            })
              .then(response => response.ok ? response : Promise.reject(new Error('There was in issue canceling your request.')))
              .then(() => {
                openAlert({ message: 'You have successfully canceled your request.', type: 'success' });
              })
              .then(() => {
                const updatedRequestList = this.state.userRequests.filter(request => request.request_id !== id);
                this.setState({ userRequests: updatedRequestList });
              })
              .catch(error => {
                console.error(error);
                openAlert({ message: 'There was an issue canceling your request.', type: 'danger' });
              });

          }
        },
        {
          label: 'No'
        }
      ]
    });
  }
  selectedButton(view) {
    if (view === 'requests') return ['selected', ''];
    if (view === 'commits') return ['', 'selected'];
    return ['', ''];
  }
  setDeed(id) {
    const deedToSet = this.state.userCommits.find(commit => commit.commit_id === id);
    this.setState({ commitToDisplay: deedToSet });
  }
  generateUsersRequests() {
    return (
      this.state.userRequests.map(request => {
        return <CheckRequests
          key={request.request_id}
          requestId={request.request_id}
          headline ={request.headline}
          cancelCallback={this.cancelADeedRequest}
        />;
      })
    );
  }
  generateUsersCommits() {
    return (
      this.state.userCommits.map(commit => {
        return <CheckCommits
          key={commit.commit_id}
          commitId={commit.commit_id}
          headline ={commit.headline}
          image={commit.image_url}
          setDeed={this.setDeed}
          setView={this.setCheckDisplay}
        />;
      })
    );
  }
  generateDeed() {
    if (this.state.commitToDisplay) {
      return <Deed
        username={this.state.commitToDisplay.user_id}
        image={this.state.commitToDisplay.image_url}
        headline={this.state.commitToDisplay.headline}
        summary={this.state.commitToDisplay.summary}
        zipcode={this.state.commitToDisplay.zipcode}
        id={this.state.commitToDisplay.commit_id}
        changeView={this.setCheckDisplay}
        view={'commits'}
        commitToDeed={this.cancelACommitToADeed}
        secondButton={'CANCEL'}
      />;
    }
  }
  componentDidMount() {
    fetch(`api/user_requests_commits.php?id=${this.props.userData.id}`)
      .then(response => response.json())
      .then(data => {
        this.setState({ userRequests: data.requests, userCommits: data.commits });
      })
      .catch(error => console.error(error));
  }
  renderCheckDisplay() {
    if (this.state.userRequests === null && this.state.view === 'requests') {
      return 'loading requests...';
    }
    if (this.state.userRequests.length === 0 && this.state.view === 'requests') {
      return 'You have no requests';
    }
    if (this.state.userRequests !== null && this.state.view === 'requests') {
      return this.generateUsersRequests();
    }
    if (this.state.userCommits !== null && this.state.view === 'commits') {
      return this.generateUsersCommits();
    }
    if (this.state.userCommits === null && this.state.view === 'commits') {
      return 'loading commits...';
    }
    if (this.state.userCommits.length === 0 && this.state.view === 'commits') {
      return 'You have no commits';
    }
    if (this.state.view === 'deed') {
      return this.generateDeed();
    }
  }
  render() {
    const selected = this.selectedButton(this.state.view);
    const display = this.renderCheckDisplay();
    return (
      <div className="container">
        <Alert />
        <Header/>
        <div className="checkDeedButtonContainer">
          <button onClick={() => this.setCheckDisplay('requests')} className = {selected[0]}>REQUESTS</button>
          <button onClick={() => this.setCheckDisplay('commits')} className = {selected[1]}>COMMITS</button>
        </div>
        <div className="checkContainer">
          {display}
        </div>
        <Footer setView={this.props.setView} />
      </div>
    );
  }
}

export default Check;
