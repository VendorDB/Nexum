// Copyright (C) 2024 Marcus Huber (xenorio) <dev@xenorio.xyz>
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Handler } from 'express'
import mongo from '@util/mongo'

export const get: Handler = async (req, res) => {
	
	const pageSize = parseInt(<string>req.query.limit) || 25
	const pageNumber = parseInt(<string>req.query.page) || 1
	const skipItems = (pageNumber - 1) * pageSize

	const pipeline = []

	pipeline.push({ $match: {isHeld: true} })
	pipeline.push({ $sort: { created: 1, _id: 1 } })
	pipeline.push({ $skip: skipItems })
	pipeline.push({ $limit: pageSize })

	const reviews = <Review[]>(await mongo.aggregate('Reviews', pipeline))
	
	res.json(reviews)

}