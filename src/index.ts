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

import 'module-alias/register'
import express from 'express'
import { router } from 'express-file-routing'
import cookieParser from 'cookie-parser'
import config from 'config'
import path from 'path'
import AuthMiddleware from '@middleware/auth'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import { Request, Response } from 'express'

const app = express()

app.set('trust proxy', '127.0.0.1')

async function init() {

	app.use('/api/v*/user/resend-verification', rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
		standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
		legacyHeaders: false, // Disable the `X-RateLimit-*` headers
		message: async (req: Request, res: Response) => {
			res.setHeader('content-type', 'application/json')
			return {
				status: 'ERROR',
				error: 'TOO_MANY_REQUESTS',
				message: 'You\'re doing this too often'
			}
		}
	}))

	app.use(cors())
	app.use(express.json())
	app.use(cookieParser())
	app.use('/', AuthMiddleware)
	app.use(config.get('path-prefix'), await router({
		directory: path.join(__dirname, 'routes')
	}))


	app.listen(config.get('port'), () => {
		console.log('Listening on port ' + config.get('port'))
	})
}

init()





