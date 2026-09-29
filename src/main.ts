/**
 * Application entry point. Imports the root component so it registers its
 * custom element; index.html only needs to load this single bootstrap file.
 */
import {seedEmployeesIfEmpty} from './services/employee-store';
import './shell/app-shell';

// Populate localStorage with dummy employees on first run.
seedEmployeesIfEmpty();
