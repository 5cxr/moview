package com.moview.dto;

import com.moview.model.Movie;

public class MovieResponse {

    private Integer movieId;
    private String title;
    private String genre;
    private Integer releaseYear;
    private String director;
    private Double avgRating;
    private long reviewCount;

    public MovieResponse(Movie movie) {
        this(movie, null, 0);
    }

    public MovieResponse(Movie movie, Double avgRating, long reviewCount) {
        this.movieId = movie.getMovieId();
        this.title = movie.getTitle();
        this.genre = movie.getGenre();
        this.releaseYear = movie.getReleaseYear();
        this.director = movie.getDirector();
        this.avgRating = avgRating;
        this.reviewCount = reviewCount;
    }

    public Integer getMovieId() {
        return movieId;
    }

    public String getTitle() {
        return title;
    }

    public String getGenre() {
        return genre;
    }

    public Integer getReleaseYear() {
        return releaseYear;
    }

    public String getDirector() {
        return director;
    }

    public Double getAvgRating() {
        return avgRating;
    }

    public long getReviewCount() {
        return reviewCount;
    }
}
