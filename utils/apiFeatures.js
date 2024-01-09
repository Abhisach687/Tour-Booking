const { Op } = require('sequelize');

class APIFeatures {
  constructor(model, queryString) {
    this.model = model;
    this.queryString = queryString;
  }

  filter() {
    const queryObject = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObject[el]);

    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
    this.query = JSON.parse(queryStr);

    const operatorsAliases = {
      $gt: Op.gt,
      $gte: Op.gte,
      $lt: Op.lt,
      $lte: Op.lte
    };

    Object.keys(this.query).forEach(key => {
      if (this.query[key] && typeof this.query[key] === 'object') {
        Object.keys(this.query[key]).forEach(operator => {
          if (operatorsAliases[operator]) {
            this.query[key][operatorsAliases[operator]] = this.query[key][
              operator
            ];
            delete this.query[key][operator];
          }
        });
      }
    });

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').map(field => {
        let direction = 'ASC';
        if (field[0] === '-') {
          direction = 'DESC';
          field = field.substring(1);
        }
        return [field, direction];
      });
      this.order = sortBy;
    } else {
      this.order = [['createdAt', 'DESC']];
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',');
      const includedFields = fields.filter(field => !field.startsWith('-'));
      const excludedFields = fields
        .filter(field => field.startsWith('-'))
        .map(field => field.substring(1)); // remove the '-' prefix

      // Get all attributes of the model
      const allAttributes = Object.keys(this.model.rawAttributes);

      // Remove excluded fields from all attributes
      const finalAttributes = allAttributes.filter(
        attr => !excludedFields.includes(attr)
      );

      // If there are included fields, use them, otherwise use all attributes except excluded fields
      this.attributes =
        includedFields.length > 0 ? includedFields : finalAttributes;
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const offset = (page - 1) * limit;

    this.limit = limit;
    this.offset = offset;

    return this;
  }

  async execute() {
    return await this.model.findAll({
      where: this.query,
      order: this.order,
      attributes: this.attributes,
      limit: this.limit,
      offset: this.offset
    });
  }
}

module.exports = APIFeatures;
