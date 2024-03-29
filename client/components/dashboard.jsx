import React from 'react';
import Header from './header';
import Review from './reviews';
import ReviewModal from './review-modal';
import DashFooter2 from './dash-footer-2';
import StarRatingComponent from 'react-star-rating-component';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'commit',
      userReviews: [],
      reviewToDisplay: null
    };
    this.setReviewToDisplay = this.setReviewToDisplay.bind(this);
    this.hideReviewModal = this.hideReviewModal.bind(this);
  }
  componentDidMount() {
    fetch(`api/get-review.php?id=${this.props.userData.id}`)
      .then(response => response.json())
      .then(data => {
        this.setState({ userReviews: data });
      })
      .catch(error => console.error(error));
  }
  displayReviews() {
    if (this.state.userReviews.length === 0) {
      return 'No reviews';
    }
    return this.state.userReviews.map(data => {
      return <Review key={data.review_id} setReview={this.setReviewToDisplay} id={data.review_id} username={data.username} category={data.category_name} rating={data.rating} image={data.image_url} />;
    });
  }
  setReviewToDisplay(id) {
    const review = this.state.userReviews.find(review => review.review_id === id);
    this.setState({ reviewToDisplay: review });
  }
  hideReviewModal() {
    this.setState({ reviewToDisplay: null });
  }
  getReviewStars() {
    const totalReviews = this.state.userReviews.length;
    let reviewAverage = 0;
    this.state.userReviews.forEach(object => {
      reviewAverage += parseInt(object.rating);
    });
    reviewAverage = Math.floor(reviewAverage / totalReviews);
    if (isNaN(reviewAverage)) {
      return 0;
    }
    return reviewAverage;
  }
  render() {
    const reviewStars = this.getReviewStars();
    const totalReviews = this.state.userReviews.length;
    const reviewsToDisplay = this.displayReviews();
    const mountModal = this.state.reviewToDisplay
      ? <ReviewModal
        review={this.state.reviewToDisplay}
        hide={this.hideReviewModal} />
      : '';
    return (
      <>
      {mountModal}
      <div className="container">
        <Header/>
        <div className="userProfileContainer">
          <div className="userProfile">
            <div className="userInfo">
              <div className="userName">{this.props.userData.username}</div>
              <div className="totalReviews"><span>{totalReviews}</span> Reviews</div>
              <div className="currentRating">
                <StarRatingComponent name="rating" editing={false} value={reviewStars} />
              </div>
            </div>
            <div className="userProfileImageContainer">
              <img className="userImage"src={this.props.userData.image_url} alt="your profile image"/>
            </div>
          </div>
        </div>
        <div className="recentReviews">
          <div className="heading">
          YOUR RECENT REVIEWS
          </div>
          <div className="reviewsContainer">
            {reviewsToDisplay}
          </div>
        </div>
        <DashFooter2 setView={this.props.setView}/>
      </div>
      </>
    );
  }
}

export default Dashboard;
