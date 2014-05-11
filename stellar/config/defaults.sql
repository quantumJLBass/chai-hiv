


/*

We are just added functions and indexs here that can't be auto generated


*/










/* clear functions */
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CalculateDistance]') AND type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
DROP FUNCTION [CalculateDistance]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LatitudePlusDistance]') AND type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
DROP FUNCTION [LatitudePlusDistance]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LongitudePlusDistance]') AND type in (N'FN', N'IF', N'TF', N'FS', N'FT'))
DROP FUNCTION [LongitudePlusDistance]
GO




/* These functions are for scearhing by zip codes
IF  EXISTS (SELECT * FROM sys.indexes  WHERE name  = N'[IX_campus_longitude_latitude]')
DROP INDEX [IX_campus_longitude_latitude] ON [campus]
GO
CREATE NONCLUSTERED INDEX IX_campus_longitude_latitude ON dbo.[campus]([longitude],[latitude], [zipcode])
GO
 */
/* Make functions to set up the searching but radius of a zip
CREATE FUNCTION [CalculateDistance]
	(@Longitude1 DECIMAL(8,5), 
	 @Latitude1  DECIMAL(8,5),
	 @Longitude2 DECIMAL(8,5),
	 @Latitude2  DECIMAL(8,5))
	RETURNS FLOAT
	AS
	BEGIN
	DECLARE @Temp FLOAT
	SET @Temp = SIN(@Latitude1/57.2957795130823) * SIN(@Latitude2/57.2957795130823) + COS(@Latitude1/57.2957795130823) * COS(@Latitude2/57.2957795130823) * COS(@Longitude2/57.2957795130823 - @Longitude1/57.2957795130823)
	IF @Temp > 1 
		SET @Temp = 1
	ELSE IF @Temp < -1
		SET @Temp = -1
	RETURN (3958.75586574 * ACOS(@Temp))
	END
GO

CREATE FUNCTION [dbo].[LatitudePlusDistance](@StartLatitude FLOAT, @Distance FLOAT) RETURNS FLOAT
AS
BEGIN
	RETURN (SELECT @StartLatitude + SQRT(@Distance * @Distance / 4766.8999155991))
	END
GO

CREATE FUNCTION [LongitudePlusDistance]
	(@StartLongitude FLOAT,
	 @StartLatitude FLOAT,
	 @Distance FLOAT)
RETURNS FLOAT
AS
BEGIN
	RETURN (SELECT @StartLongitude + SQRT(@Distance * @Distance / (4784.39411916406 * COS(2 * @StartLatitude / 114.591559026165) * COS(2 * @StartLatitude / 114.591559026165))))
	END
GO
INSERT INTO [campus]
			([name],[city],[state],[state_abbrev],[latitude],[longitude],[zipcode])
		VALUES
			('Pullman','Pullman','Washington','WA',46.7320368670458,-117.15451240539551,'99163'),
			('Tri-Cities','Richland','Washington','WA',46.32994669896143,-119.26323562860489,'99354'),
			('Vancouver','Vancouver','Washington','WA',45.73226906648018,-122.63564944267273,'98686'),
			('Riverpoint','Spokane','Washington','WA',47.66110972448931,-117.40625381469726,'99210')
GO
 */