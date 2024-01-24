// Copyright (C) 2023 Marcus Huber (xenorio) <dev@xenorio.xyz>
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

export const post: Handler = async (req, res) => {

	const data = req.body

	const page = parseInt(req.query.page as string) || 1
	const limit = parseInt(req.query.limit as string) || 10

	const pipeline = buildAggregationPipeline(data, page, limit)
	const [vendors, totalCount] = await mongo.aggregateWithCount('Vendors', pipeline)

	const totalPages = Math.ceil(totalCount / limit)

	res.json({
		vendors,
		page,
		limit,
		totalPages,
		totalCount,
	})

}


function buildAggregationPipeline(data: any, page: number, limit: number) {
	const pipeline = []

	// Match stage for filtering based on name
	if (data.name) {
		pipeline.push({ $match: { name: { $regex: data.name, $options: 'i' } } })
	}

	// Match stage for filtering based on minimum average rating
	if (data.minAverageRating) {
		pipeline.push({
			$match: {
				$expr: { $gte: ['$averageRating', data.minAverageRating] },
			},
		})
	}

	// Match stage for filtering based on shippingTo
	if (data.shippingTo) {
		pipeline.push({ $match: { shippingTo: { $in: data.shippingTo } } })
	}

	const similarityFields = ['name', 'description']

	// Calculate split values for similarity fields
	const splitValues: { [key: string]: { $split: any[] } } = {}
	for (const field of similarityFields) {
		if (data[field]) {
			splitValues[field] = { $split: [`$${field}`, field === 'name' ? ' ' : ''] }
		}
	}

	// Add similarity sorting fields with similarity scores
	// For the love of god, don't ask me what this is. Ask ChatGPT, he wrote it.
	const sortFields = similarityFields.reduce((acc: Array<any>, field) => {
		if (data[field]) {
			acc.push({
				[`similarity${field.charAt(0).toUpperCase() + field.slice(1)}`]: {
					$let: {
						vars: { dataField: data[field], queryField: `$${field}` },
						in: {
							$divide: [
								{
									$add: [
										{
											$subtract: [
												{ $strLenCP: '$$dataField' },
												{
													$reduce: {
														input: {
															$map: {
																input: { $range: [0, { $strLenCP: '$$dataField' }] },
																as: 'i',
																in: {
																	$cond: [
																		{ $eq: [{ $substrCP: ['$$dataField', '$$i', 1] }, { $substrCP: ['$$queryField', '$$i', 1] }] },
																		0,
																		1,
																	],
																},
															},
														},
														initialValue: 0,
														in: { $sum: ['$$value', '$$this'] },
													},
												},
											],
										},
										{
											$subtract: [
												{ $strLenCP: '$$queryField' },
												{
													$reduce: {
														input: {
															$map: {
																input: { $range: [0, { $strLenCP: '$$queryField' }] },
																as: 'i',
																in: {
																	$cond: [
																		{ $eq: [{ $substrCP: ['$$queryField', '$$i', 1] }, { $substrCP: ['$$dataField', '$$i', 1] }] },
																		0,
																		1,
																	],
																},
															},
														},
														initialValue: 0,
														in: { $sum: ['$$value', '$$this'] },
													},
												},
											],
										},
									],
								},
								{ $max: [{ $strLenCP: '$$dataField' }, { $strLenCP: '$$queryField' }] },
							],
						},
					},
				},
			})
		}
		return acc
	}, [])

	// If there are similarity sorting fields, add the $addFields stage
	if (sortFields.length > 0) {
		pipeline.push({
			$addFields: {
				similarityScores: { $mergeObjects: sortFields.reduce((acc, obj) => ({ ...acc, ...obj }), {}) },
				averageSimilarity: {
					$divide: [
						{
							$add: sortFields.map((field) => ({ $ifNull: [field[Object.keys(field)[0]], 0] })),
						},
						sortFields.length,
					],
				},
			},
		})
	}

	// Sort by average similarity score and minimum average rating
	if (sortFields.length > 0) {
		const sortObj: { [key: string]: number } = {}
		sortObj['averageSimilarity'] = -1 // Sort by average similarity in descending order (higher scores first)
		sortObj['minAverageRating'] = -1 // Sort by minimum average rating in descending order (higher ratings first)

		pipeline.push({ $sort: sortObj })
	}

	pipeline.push({ $sort: {averageRating: -1, name: 1} })

	// Pagination: Add $skip and $limit stages
	const skip = (page - 1) * limit
	pipeline.push({ $skip: skip })
	pipeline.push({ $limit: limit })


	return pipeline
}


