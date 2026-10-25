/**
 * Demo host for <movie-card>.
 *
 * Shows the controlled-component pattern: the host owns the data, passes it in
 * via the `movies` property, and listens for the `movie-add` event to update
 * that data. The component itself stays dumb and framework-agnostic.
 */
import './components/movie-card';
import type {Movie, MovieCard} from './components/movie-card';

const seedMovies: Movie[] = [
  {employee: 'John Doe', movie: 'The Jungle Book', rating: '4 - Good', recommended: true},
  {employee: 'Jane Smith', movie: 'Inception', rating: '5 - Excellent', recommended: true},
  {employee: 'Alan Turing', movie: 'The Matrix', rating: '5 - Excellent', recommended: true},
  {employee: 'Ada Lovelace', movie: 'Interstellar', rating: '4 - Good', recommended: true},
  {employee: 'Grace Hopper', movie: 'Arrival', rating: '4 - Good', recommended: false},
];

const card = document.querySelector<MovieCard>('movie-card');

if (card !== null) {
  card.movies = seedMovies;
  card.addEventListener('movie-add', (movieAddEvent: CustomEvent<Movie>): void => {
    card.movies = [movieAddEvent.detail, ...card.movies];
  });
}
