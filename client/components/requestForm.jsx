import React from 'react';
import apiKeys from './apikeys';
import Alert, { openAlert } from 'simple-react-alert';

class RequestForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headline: '',
      zipcode: null,
      summary: '',
      lat: null,
      long: null,
      gotUserLocation: false
    };
    this.trackHeadline = this.trackHeadline.bind(this);
    this.trackZipcode = this.trackZipcode.bind(this);
    this.trackSummary = this.trackSummary.bind(this);
    this.generateRequest = this.generateRequest.bind(this);
    this.getUserLocation = this.getUserLocation.bind(this);
  }

  getUserLocation(e) {
    e.preventDefault();
    navigator.geolocation.getCurrentPosition(position => {
      this.setState({
        lat: position.coords.latitude,
        long: position.coords.longitude }, () => {
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.state.lat},${this.state.long}&key=${apiKeys.geocoding}`)
          .then(response => response.ok ? response.json() : Promise.reject(new Error('There was an error retrieving your current location')))
          .then(data => {
            let zipcode = data.results[0].address_components.find(result => {
              return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(result.short_name);
            }).short_name;
            if (zipcode.length !== 5) {
              zipcode = '00000';
            }
            this.setState({ zipcode: zipcode, gotUserLocation: true });
          })
          .catch(() => {
            openAlert({ message: 'There was an issue retrieving your location.', type: 'warning' });
          });
      });
    });
  }

  generateRequest() {
    const request = {
      'category_id': this.props.categoryId,
      'user_id': this.props.userId,
      'headline': this.state.headline,
      'zipcode': this.state.zipcode,
      'summary': this.state.summary,
      'latitude': this.state.lat,
      'longitude': this.state.long
    };
    this.setState({
      headline: '',
      zipcode: '',
      summary: '',
      gotUserLocation: false
    });
    this.props.requestCallback(request);
  }
  trackHeadline(event) {
    this.setState({ headline: event.target.value });
  }
  trackZipcode(event) {
    this.setState({ zipcode: event.target.value });
  }
  trackSummary(event) {
    this.setState({ summary: event.target.value });
  }

  render() {
    const currentLocationButton = this.state.gotUserLocation ? this.state.zipcode : 'GET CURRENT LOCATION';
    return (
      <div className="requestContainer">
        <Alert />
        <div className="heading">REQUEST INFO</div>
        <div className="requestFormContainer">
          <form className="requestForm">
            <input type="text" maxLength="61" className="requestBoxHeadline" id="headline" placeholder="HEADLINE" onChange={this.trackHeadline} value={this.state.headline} />
            <button onClick={this.getUserLocation} className="requestBoxZipcode">{currentLocationButton}</button>
            <label className="summaryLabel">SUMMARY</label>
            <textarea id="summary" className="requestBoxSummary" cols="30" rows="8" onChange={this.trackSummary} value={ this.state.summary }></textarea>
          </form>
        </div>
        <div className="deedButtonContainer">
          <button onClick={() => this.props.changeView('categoryList')}>BACK</button>
          <button onClick={this.generateRequest}>SUBMIT</button>
        </div>
      </div>
    );
  }

}

export default RequestForm;
