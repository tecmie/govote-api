const db = require('../db/db');
const _ = require('lodash');

const props = [
  'id',
  'name',
  'address',
  'area',
  'city_id',
  'state_id',
  'latitude',
  'longitude'
];

class Location {
  constructor(data) {
    data = _.pick(data, props);
    Object.assign(this, data);
  }

  async all({ order, page, limit }) {
    order = order || 'desc';
    page = +page || 1;
    limit = +limit || 20;

    try {
      const locations = await db('locations')
        .select('locations.*', 'states.name as state', 'cities.name as city')
        .orderBy('locations.id', order)
        .offset(+(page - 1) * +limit)
        .limit(+limit)
        .leftJoin('states', 'locations.state_id', 'states.id')
        .leftJoin('cities', 'locations.city_id', 'cities.id');
      const meta = { order, page, limit };
      return { locations, meta };
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async find(id) {
    try {
      const [location] = await db('locations')
        .select('locations.*', 'states.name as state', 'cities.name as city')
        .where({ 'locations.id': id })
        .limit(1)
        .leftJoin('states', 'locations.state_id', 'states.id')
        .leftJoin('cities', 'locations.city_id', 'cities.id');
      if (!location) return {};
      Object.assign(this, location);
      return location;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async store() {
    try {
      const data = _.pick(this, props);
      const [id] = await db('locations').insert(data);
      return Object.assign({ id }, this);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async save(request) {
    try {
      const data = _.pick(this, props);
      data['updatedAt'] = new Date();
      return await db('locations')
        .update(data)
        .where({ id: this.id });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async destroy(request) {
    try {
      return await db('locations')
        .delete()
        .where({ id: this.id });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async withOne(relationship, table) {
    try {
      const tableId = `${table}_id`;
      const [result] = await db(table)
        .where({ id: this[tableId] })
        .limit(1);
      if (result) this[relationship] = result;
      return this;
    } catch (error) {}
  }
}

module.exports = { Location };
