package com.moview.dto;

import com.moview.model.Review;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ReviewResponse {

    private Integer reviewId;
    private Integer userId;
    private String username;
    private Integer movieId;
    private String movieTitle;
    private Integer movieReleaseYear;
    private String moviePosterUrl;
    private BigDecimal rating;
    private Boolean liked;
    private String reviewText;
    private LocalDate watchedDate;

    public ReviewResponse(Review review) {
        this.reviewId = review.getReviewId();
        this.userId = review.getUser().getUserId();
        this.username = review.getUser().getUsername();
        this.movieId = review.getMovie().getMovieId();
        this.movieTitle = review.getMovie().getTitle();
        this.movieReleaseYear = review.getMovie().getReleaseYear();
        this.moviePosterUrl = review.getMovie().getPosterUrl();
        this.rating = review.getRating();
        this.liked = review.getLiked();
        this.reviewText = review.getReviewText();
        this.watchedDate = review.getWatchedDate();
    }

    public Integer getReviewId() {
        return reviewId;
    }

    public Integer getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public Integer getMovieId() {
        return movieId;
    }

    public String getMovieTitle() {
        return movieTitle;
    }

    public Integer getMovieReleaseYear() {
        return movieReleaseYear;
    }

    public String getMoviePosterUrl() {
        return moviePosterUrl;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public Boolean getLiked() {
        return liked;
    }

    public String getReviewText() {
        return reviewText;
    }

    public LocalDate getWatchedDate() {
        return watchedDate;
    }
}
