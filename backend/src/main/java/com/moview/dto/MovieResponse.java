package com.moview.dto;

import com.moview.model.Movie;

public class MovieResponse {

    private Integer movieId;
    private String title;
    private String genre;
    private Integer releaseYear;
    private String director;

    public MovieResponse(Movie movie) {
        this.movieId = movie.getMovieId();
        this.title = movie.getTitle();
        this.genre = movie.getGenre();
        this.releaseYear = movie.getReleaseYear();
        this.director = movie.getDirector();
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
}
