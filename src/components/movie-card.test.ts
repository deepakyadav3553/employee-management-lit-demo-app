import {html, fixture, expect, oneEvent} from '@open-wc/testing';
import './movie-card';
import {DEFAULT_RATINGS, type Movie, type MovieCard} from './movie-card';

const sampleMovies: Movie[] = [
  {employee: 'Alice', movie: 'Movie One', rating: '4 - Good', recommended: true},
  {employee: 'Bob', movie: 'Movie Two', rating: '3 - OK', recommended: false},
];

const fillForm = async (
  element: MovieCard,
  employeeName: string,
  movieName: string,
  ratingValue: string,
  recommend: boolean
): Promise<void> => {
  const root = element.shadowRoot!;

  const employeeInput = root.querySelector<HTMLInputElement>('#employee')!;
  employeeInput.value = employeeName;
  employeeInput.dispatchEvent(new Event('input'));

  const movieInput = root.querySelector<HTMLInputElement>('#movie')!;
  movieInput.value = movieName;
  movieInput.dispatchEvent(new Event('input'));

  const ratingSelect = root.querySelector<HTMLSelectElement>('#rating')!;
  ratingSelect.value = ratingValue;
  ratingSelect.dispatchEvent(new Event('change'));

  const recommendCheckbox =
    root.querySelector<HTMLInputElement>('.checkbox input')!;
  recommendCheckbox.checked = recommend;
  recommendCheckbox.dispatchEvent(new Event('change'));

  await element.updateComplete;
};

describe('movie-card', () => {
  it('defaults movies to an empty array and shows the empty state', async () => {
    const element = await fixture<MovieCard>(html`<movie-card></movie-card>`);

    expect(element.movies).to.deep.equal([]);
    expect(element.shadowRoot!.querySelector('.empty')).to.not.be.null;
    expect(element.shadowRoot!.querySelector('table')).to.be.null;
  });

  it('renders one table row per movie', async () => {
    const element = await fixture<MovieCard>(html`<movie-card></movie-card>`);

    element.movies = sampleMovies;
    await element.updateComplete;

    const rows = element.shadowRoot!.querySelectorAll('tbody tr');
    expect(rows.length).to.equal(sampleMovies.length);
    expect(element.shadowRoot!.querySelector('.empty')).to.be.null;
  });

  it('renders one mobile card row per movie', async () => {
    const element = await fixture<MovieCard>(html`<movie-card></movie-card>`);

    element.movies = sampleMovies;
    await element.updateComplete;

    const cardRows = element.shadowRoot!.querySelectorAll('.cards .row');
    expect(cardRows.length).to.equal(sampleMovies.length);
  });

  it('uses the default ratings and accepts a custom list', async () => {
    const element = await fixture<MovieCard>(html`<movie-card></movie-card>`);

    const defaultOptions =
      element.shadowRoot!.querySelectorAll('#rating option');
    expect(defaultOptions.length).to.equal(DEFAULT_RATINGS.length + 1);

    element.ratings = ['Low', 'High'];
    await element.updateComplete;

    const customOptions =
      element.shadowRoot!.querySelectorAll('#rating option');
    expect(customOptions.length).to.equal(3);
  });

  it('disables Add until the required fields are filled', async () => {
    const element = await fixture<MovieCard>(html`<movie-card></movie-card>`);
    const addButton =
      element.shadowRoot!.querySelector<HTMLButtonElement>('.add-btn')!;

    expect(addButton.disabled).to.be.true;

    await fillForm(element, 'Carol', 'Movie Three', '5 - Excellent', false);
    expect(addButton.disabled).to.be.false;
  });

  it('keeps Add disabled when inputs are only whitespace', async () => {
    const element = await fixture<MovieCard>(html`<movie-card></movie-card>`);
    const addButton =
      element.shadowRoot!.querySelector<HTMLButtonElement>('.add-btn')!;

    await fillForm(element, '   ', '   ', '4 - Good', false);
    expect(addButton.disabled).to.be.true;
  });

  it('emits a trimmed movie-add event that bubbles and is composed', async () => {
    const element = await fixture<MovieCard>(html`<movie-card></movie-card>`);
    await fillForm(element, '  Dave  ', '  Movie Four  ', '4 - Good', true);

    const addButton =
      element.shadowRoot!.querySelector<HTMLButtonElement>('.add-btn')!;
    setTimeout(() => addButton.click());
    const addEvent = await oneEvent(element, 'movie-add');

    expect(addEvent.detail).to.deep.equal({
      employee: 'Dave',
      movie: 'Movie Four',
      rating: '4 - Good',
      recommended: true,
    });
    expect(addEvent.bubbles).to.be.true;
    expect(addEvent.composed).to.be.true;
  });

  it('does not mutate its own movies on submit (dumb component)', async () => {
    const element = await fixture<MovieCard>(html`<movie-card></movie-card>`);
    element.movies = [...sampleMovies];
    await element.updateComplete;

    await fillForm(element, 'Eve', 'Movie Five', '3 - OK', false);
    element.shadowRoot!.querySelector<HTMLButtonElement>('.add-btn')!.click();
    await element.updateComplete;

    expect(element.movies.length).to.equal(sampleMovies.length);
  });

  it('clears the form fields after a successful submit', async () => {
    const element = await fixture<MovieCard>(html`<movie-card></movie-card>`);
    await fillForm(element, 'Frank', 'Movie Six', '5 - Excellent', true);

    element.shadowRoot!.querySelector<HTMLButtonElement>('.add-btn')!.click();
    await element.updateComplete;

    const employeeInput =
      element.shadowRoot!.querySelector<HTMLInputElement>('#employee')!;
    const movieInput =
      element.shadowRoot!.querySelector<HTMLInputElement>('#movie')!;
    const recommendCheckbox =
      element.shadowRoot!.querySelector<HTMLInputElement>('.checkbox input')!;

    expect(employeeInput.value).to.equal('');
    expect(movieInput.value).to.equal('');
    expect(recommendCheckbox.checked).to.be.false;
  });

  it('does not emit when the form is submitted while invalid', async () => {
    const element = await fixture<MovieCard>(html`<movie-card></movie-card>`);

    let emitted = false;
    element.addEventListener('movie-add', () => {
      emitted = true;
    });

    element
      .shadowRoot!.querySelector<HTMLFormElement>('form')!
      .dispatchEvent(new Event('submit', {cancelable: true}));
    await element.updateComplete;

    expect(emitted).to.be.false;
  });

  it('expands the first row by default and toggles on click', async () => {
    const element = await fixture<MovieCard>(html`<movie-card></movie-card>`);
    element.movies = sampleMovies;
    await element.updateComplete;

    const rows = (): NodeListOf<HTMLDivElement> =>
      element.shadowRoot!.querySelectorAll<HTMLDivElement>('.cards .row');
    const summaries = (): NodeListOf<HTMLButtonElement> =>
      element.shadowRoot!.querySelectorAll<HTMLButtonElement>('.row-summary');

    expect(rows()[0].hasAttribute('open')).to.be.true;

    summaries()[0].click();
    await element.updateComplete;
    expect(rows()[0].hasAttribute('open')).to.be.false;

    summaries()[1].click();
    await element.updateComplete;
    expect(rows()[1].hasAttribute('open')).to.be.true;
  });

  it('exposes overridable section-heading properties', async () => {
    const element = await fixture<MovieCard>(html`<movie-card></movie-card>`);

    expect(element.formTitle).to.be.a('string');
    expect(element.listTitle).to.be.a('string');

    element.formTitle = 'Lägg till film';
    element.listTitle = 'Filmlista';
    await element.updateComplete;

    const headings = element.shadowRoot!.querySelectorAll('h2');
    expect(headings.length).to.equal(2);
  });
});
