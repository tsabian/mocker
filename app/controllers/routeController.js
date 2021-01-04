import RouteService from '../services/routesService';
import Request from 'express';
import Response from 'express';

/**
 * Get all routes
 * @param {RouteService} routesService Set RouteService injection
 * @param {Request} req Set express request object
 * @param {Response} res Set express response object
 */
export function route(routesService, req, res) {
    routesService.listRoutes()
    .then(routes => {
        return res.status(200).json(routes);
    })
    .catch(err => {
        return res.status(500);
    })
}

/**
 * Get route by id
 * @param {RouteService} routesService Set RouteService injection
 * @param {Request} req Set express request object
 * @param {Response} res Set express response object
 */
export function routeById(routesService, req, res) {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json( {
            param: 'id',
            description: 'id must not be null or empty'
        });
    }
    routesService.getBy(id)
    .then(route => {
        return res.status(200).json(route);
    })
    .catch(err => {
        return res.status(500);
    })
}