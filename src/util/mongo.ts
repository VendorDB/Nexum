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


import config from 'config'
import { MongoClient, ObjectId, Db } from 'mongodb'

const server: string = config.get('database.url')
const db_name: string = config.get('database.name')

let db: Db

MongoClient.connect(server)
	.then(s => {
		db = s.db(db_name)
	})
	.catch(err => {
		console.error(err)
	})

export const insert = (collection: string, obj: any) => {
	return new Promise<object>((resolve, reject) => {
		db.collection(collection).insertOne(obj)
			.then(res => resolve(obj))
	})
}

export const query = (collection: string, query: any) => {
	return new Promise<object[] | null>((resolve, reject) => {
		if (query._id) {
			try {
				query._id = new ObjectId(query._id)
			} catch (error) {
				return reject()
			}
		}
		const res = db.collection(collection).find(query)
		if (!res) return reject(null)
		res.toArray()
			.then((resArray: any) => resolve(resArray))
	})
}

export const queryOne = (collection: string, query: any, projection?: any) => {
	return new Promise<object | null>((resolve, reject) => {
		if (query._id) {
			try {
				query._id = new ObjectId(query._id)
			} catch (error) {
				return reject()
			}
		}
		db.collection(collection).findOne(query, projection)
			.then(res => {
				if (!res) return resolve(null)
				resolve(res)
			})
	})
}

export const update = (collection: string, query: any, newvals: any) => {
	return new Promise<object>((resolve, reject) => {
		const obj = { $set: newvals }
		db.collection(collection).updateOne(query, obj)
			.then(res => resolve(res))
	})
}

export const remove = (collection: string, query: any) => {
	return new Promise<object>((resolve, reject) => {
		db.collection(collection).deleteOne(query)
			.then(res => resolve(res))
	})
}

export const aggregate = (collection: string, pipeline: any[]) => {
	return new Promise<object[]>((resolve, reject) => {
		db.collection(collection).aggregate(pipeline).toArray()
			.then(res => resolve(res))
	})
}

export default {
	insert,
	query,
	queryOne,
	remove,
	update,
	aggregate
}