import {Component} from 'react'
import './index.css'
import Cookies from 'js-cookie'
// import {async} from 'rxjs'
import getImageColors from 'get-image-colors'
import Header from '../Header'
import MovieDetailsLink from '../MovieDetailsLink'

import FailureView from '../FailureView'
// import ReactSlick from '../ReactSlick'
import Loading from '../Loading'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Theme extends Component {
  state = {
    redThemedList: [],
    apiStatus: apiStatusConstants.initial,
  }

  async componentDidMount() {
    const combinedMoviesList = await this.getCombinedList()
    // const redMoviesList = await this.getRedMoviesList(combinedMoviesList)

    this.setState({
      redThemedList: combinedMoviesList,
      apiStatus: apiStatusConstants.success,
    })
  }

  getRedMoviesList = async moviesList => {
    const redDominantImages = []

    for (let i = 0; i < moviesList.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const colors = await getImageColors(moviesList[i].posterPath)

      const averageColor = colors.reduce(
        (acc, color) => {
          acc[0] += color[0]
          acc[1] += color[1]
          acc[2] += color[2]
          return acc
        },
        [0, 0, 0],
      )

      averageColor[0] /= colors.length
      averageColor[1] /= colors.length
      averageColor[2] /= colors.length

      if (
        averageColor[0] > averageColor[1] &&
        averageColor[0] > averageColor[2]
      ) {
        redDominantImages.push(moviesList[i])
      }
    }

    return redDominantImages
  }

  getCombinedList = async () => {
    //   trending movies get
    const jwtToken = Cookies.get('jwt_token')
    const TMoviesApi = 'https://apis.ccbp.in/movies-app/trending-movies'
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    // trending movies get
    const trendingResponse = await fetch(TMoviesApi, options)
    let updatedTMData
    if (trendingResponse.ok === true) {
      const fetchedData = await trendingResponse.json()
      updatedTMData = fetchedData.results.map(eachMovie => ({
        id: eachMovie.id,
        posterPath: eachMovie.poster_path,
        title: eachMovie.title,
      }))
    }
    console.log(updatedTMData[0].posterPath)
    // originals get
    let updatedOriginalsData
    const originalsMoviesApi = 'https://apis.ccbp.in/movies-app/originals'
    const originalsResponse = await fetch(originalsMoviesApi, options)
    if (originalsResponse.ok === true) {
      const fetchedData = await originalsResponse.json()
      updatedOriginalsData = fetchedData.results.map(eachMovie => ({
        id: eachMovie.id,
        posterPath: eachMovie.poster_path,
        title: eachMovie.title,
      }))
    }
    // console.log(updatedOriginalsData)
    // popular movies get
    const popularMovieApi = 'https://apis.ccbp.in/movies-app/popular-movies'
    const popularResponse = await fetch(popularMovieApi, options)
    let updatedPopularData
    if (popularResponse.ok === true) {
      const data = await popularResponse.json()
      updatedPopularData = data.results.map(eachMovie => ({
        backdropPath: eachMovie.backdrop_path,
        id: eachMovie.id,
        posterPath: eachMovie.poster_path,
        title: eachMovie.title,
      }))
    }
    return [...updatedTMData, ...updatedOriginalsData, ...updatedPopularData]
  }

  renderSuccessView = () => {
    const {redThemedList} = this.state
    return (
      <>
        <ul className="popular-list">
          {redThemedList.map(eachMovie => (
            <MovieDetailsLink movieDetails={eachMovie} key={eachMovie.id} />
          ))}
        </ul>
      </>
    )
  }

  renderFailureView = () => <FailureView onClickRetry={this.onClickRetry} />

  renderLoadingView = () => <Loading />

  renderPageView = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderSuccessView()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  render() {
    const {redThemedList} = this.state
    console.log(redThemedList)
    return (
      <>
        <div className="container">
          <Header />
          {this.renderPageView()}
          {/* <ul className="popular-list">
            {redThemedList.map(eachMovie => (
              <MovieDetailsLink movieDetails={eachMovie} key={eachMovie.id} />
            ))}
          </ul> */}
        </div>
      </>
    )
  }
}

export default Theme
