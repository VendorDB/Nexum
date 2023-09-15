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
import jwt, { JwtPayload } from 'jsonwebtoken'
import mongo from '@util/mongo'
import { ObjectId } from 'mongodb'
import { Request, Response, NextFunction } from 'express'

export default async (req: Request, res: Response, next: NextFunction) => {

	let token: string = req.cookies.session || req.headers['authorization']

	if (token == null) {
		next()
		return
	}

	// Remove any token types. They don't matter to us, everything is a bearer token here.
	if(token.includes(' ')){
		token = token.split(' ')[1]
	}

	let data: JwtPayload

	try {
		data = <JwtPayload>jwt.verify(token, config.get('jwt-secret'))
	} catch (error) {
		next()
		return
	}

	if (data.type == 'API') {
		req.user = <User> await mongo.queryOne('Users', {
			apiKey: data.id
		})
		req.bot = true
	} else {
		req.user = <User> await mongo.queryOne('Users', {
			_id: new ObjectId(data.id)
		})
		req.bot = false
	}

	next()


}